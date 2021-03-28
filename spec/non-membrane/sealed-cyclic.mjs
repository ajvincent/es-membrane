/*
Suppose you have the following:

  const alpha = {}, beta = {};
  alpha.next = beta;
  beta.next = alpha;

  const Alpha = getProxy(alpha);

  const map = new Map();

  getProxy(original):
  I. looks for an existing proxy in map and if it doesn't find it:
    A. creates a proxy
    B. executes a listener which may modify the proxy:
      1. defines all the keys of the proxy as proxies paralleling original's keys
         by calling getProxy
      2. seals the proxy
    C. calls map.set(original, proxy);
  II. returns map.get(original);

In the simple recursive case, this is doomed to infinite recursion:
getProxy(alpha.next.next) doesn't find anything in the map, even after
getProxy(alpha) and getProxy(alpha.next) have started (but not finished).


*******************************************************************************
*                                                                             *
*                               START UPDATE                                  *
*                                                                             *
*******************************************************************************

This problem no longer applies to es-membrane, and it should no longer apply to
your membranes - if you change the order of operations above to the following:

  getProxy(original):
  I. looks for an existing proxy in map and if it doesn't find it:
    A. creates a proxy
  II. returns map.get(original);

When a proxy trap is invoked, fill the proxy's properties:
  I. executes a listener which may modify the proxy:
    A. defines all the keys of the proxy as proxies paralleling original's keys
       by calling getProxy
    B. seals the proxy
  II. calls map.set(original, proxy);

By this change, only one proxy's properties can be filled at a time.  So there's
no reachable cycle to seal.  In the above case, Alpha's properties get filled and
the Beta proxy gets created, but Beta's properties don't get filled until the
membrane seals the Alpha proxy.  Beta will sit there happily until a trap triggers,
at which point its .next property will point to the Alpha proxy - and again, we
cannot hit a cycle to seal.

Naturally, a change like this can alter the behavior of the membrane in
significant ways - which is why you have a large battery of tests you throw at the
membrane to catch these changes...

That said, I'm still keeping this test file around, because frankly it's a very
subtle difference which caused a lot of complexity in my ProxyHandler code.  The
implementation of this change, over two commits, removed 400 more lines than it added!

*******************************************************************************
*                                                                             *
*                                END UPDATE                                   *
*                                                                             *
*******************************************************************************

The first solution I came up with used "lazy getters".  A lazy getter for an
object's property is an accessor descriptor which tries to replace itself with a
data descriptor as soon as possible.  If you don't know what accessor
descriptors and data descriptors are, read this:

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty

Unfortunately, there's a catch.  Given the following pseudo-code:
  const foo = {};
  Object.defineProperty(foo, "propertyName", lazyGetter({value: 3, writable: true}));

If I call:
  Reflect.defineProperty(foo, "propertyName", {configurable: false});

or more generically:
  Object.seal(foo);

then the lazy getter for foo.propertyName is locked in.  The ECMAScript
specification explicitly prohibits the lazy getter from being replaced with a
direct data descriptor of the form {value: 3, writable: true}.

Under the algorithm I listed above for getProxy(), I can define lazy getters
for Alpha and Alpha.next... but because they're all on the stack when I first
call getProxy(alpha), and they're all sealed before that call exits, at least
one lazy getter is locked in, and cannot be replaced.

So yes, Alpha.next.next === Alpha, but we have an accessor descriptor (a lazy
getter) forever when we wanted only data descriptors.

The second, and more reliable solution, involves a priority queue:
https://en.wikipedia.org/wiki/Priority_queue

For ECMAScript, this enters a land between synchronous functions and
asynchronous functions / Promise / await and async keywords.  If you don't
know what Promises are or what the await and async keywords are, read these:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await

A priority queue, in JavaScript, is somewhat simpler.  Most examples define
them as simple values ordered by priority flags.  In my context, I replace the
values with callback functions, which I consider much more useful.  The priority
queue I use has an array of priority names, each of which corresponds to an
array of callback functions.  Each call to the queue's next() method executes
the next highest priority callback, until there are none to execute.  If there
was a callback, queue.next() returns true.  Otherwise, it returns false.

The key to making a priority queue work here is that the call to create a
proxy cannot return a value until all of the callback functions that were
scheduled have executed.  The getProxy code inserts callbacks into the queue
with different priorities.  In the example above, getProxy directly defines
properties on the proxy, and then (in the listener) schedules a call to
Object.seal to run later - but strictly speaking not asynchronously, simply at a
lower priority.

This means that recursive calls to getProxy() insert higher-priority operations
(defining that proxy's properties as data descriptor) before lower-priority
operations (sealing a proxy and locking the data descriptors).  Most
importantly, all operations complete before any getProxy() call exits normally.

By using this approach, I no longer need lazy getters:  I can use direct data
descriptors, as the Proxy interface within the ECMAScript specification intends.

There are details which I don't cover here:
  * Exception handling
  * Return values

However, those are details to work out separately, and distract from this 
example.
*/

describe("Sealed cyclic references: ", function() {
  const map = new Map();

  const alpha = {}, beta = {};
  alpha.next = beta;
  beta.next = alpha;
  var refCount;

  function isAccessorDescriptor(desc) {
    if (typeof desc === "undefined") {
      return false;
    }
    if (!("get" in desc) && !("set" in desc))
      return false;
    return true;
  }

  beforeEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
    map.clear();
    refCount = 0;
  });

  it(
    "A very simple recursive implementation hits an infinite stack error",
    function() {
      function buildReferenceAndSeal(obj) {
        refCount++;
        if (refCount > 10)
          throw "Infinite recursion";

        if (!map.has(obj)) {
          const rv = {};

          // Simulating an observer
          {
            const desc = {
              value: buildReferenceAndSeal(obj.next),
              writable: false,
              enumerable: true,
              configurable: false
            };
            Reflect.defineProperty(rv, "next", desc);
            Object.seal(rv);
          }

          map.set(obj, rv);
        }

        return map.get(obj);
      }

      expect(function() {
        buildReferenceAndSeal(alpha);
      }).toThrow("Infinite recursion");
    }
  );

  it(
    "A lazy-getter recursive implementation can work, but leaves one lazy getter behind",
    function() {
      const inConstruction = new Map();
      function defineLazyGetter(source, target, propName) {
        let lockState = "none", lockedValue;
        function setLockedValue(value) {
          // This lockState check should be treated as an assertion.
          if (lockState !== "transient")
            throw new Error("setLockedValue should be callable exactly once!");
          lockedValue = value;
          lockState = "finalized";
        }

        const lazyDesc = {
          get: function() {
            if (lockState === "finalized")
              return lockedValue;
            if (lockState === "transient")
              return map.get(source[propName]);

            let current = Reflect.getOwnPropertyDescriptor(target, propName);
            if (current && !current.configurable)
              throw new Error("lazy getter descriptor is not configurable -- this is fatal");

            // sourceDesc is the descriptor we really want
            let sourceDesc = Reflect.getOwnPropertyDescriptor(source, propName);

            let hasValue = "value" in sourceDesc,
                value = sourceDesc.value;

            // This is necessary to force desc.value to be wrapped.
            if (hasValue) {
              sourceDesc.value = buildReferenceAndSeal(value);
            }

            if (hasValue && inConstruction.has(value)) {
              /* Ah, nuts.  Somewhere in our stack trace, the unwrapped value has
               * a proxy in this object graph under construction.  That's not
               * supposed to happen very often, but can happen during a recursive
               * Object.seal() or Object.freeze() call.  What that means is that
               * we may not be able to replace the lazy getter (which is an
               * accessor descriptor) with a data descriptor when external code
               * looks up the property on the shadow target.
               */

              inConstruction.get(value).push(setLockedValue);
              sourceDesc = lazyDesc;
              delete sourceDesc.set;
              lockState = "transient";
            }

            Reflect.deleteProperty(target, propName);
            Reflect.defineProperty(target, propName, sourceDesc);
  
            // Finally, run the actual getter.
            if (sourceDesc === undefined)
              return undefined;
            if ("get" in sourceDesc)
              return sourceDesc.get.apply(this);
            if ("value" in sourceDesc)
              return sourceDesc.value;
            return undefined;
          },

          set: function(value) {
            let current = Reflect.getOwnPropertyDescriptor(target, propName);
            if (!current.configurable)
              throw new Error("lazy getter descriptor is not configurable -- this is fatal");

            const desc = {
              value: current.value,
              writable: true,
              enumerable: current.enumerable,
              configurable: true
            };

            if (!Reflect.deleteProperty(target, propName))
              throw new Error("deleteProperty should've worked");
            if (!Reflect.defineProperty(target, propName, desc))
              throw new Error("defineProperty should've worked");

            return value;
          },

          enumerable: true,
          configurable: true
        };

        {
          let current = Reflect.getOwnPropertyDescriptor(source, propName);
          if (current && !current.enumerable)
            lazyDesc.enumerable = false;
        }

        Reflect.defineProperty(target, propName, lazyDesc);
      }

      function buildReferenceAndSeal(obj) {
        refCount++;
        if (refCount >= 10)
          throw new Error("runaway");

        if (!map.has(obj))
        {
          const rv = {};
          map.set(obj, rv);

          const callbacks = [];
          inConstruction.set(obj, callbacks);

          // Simulating an observer
          {
            defineLazyGetter(obj, rv, "next");
            // We want to trigger the lazy getter so that the property can be sealed.
            void(Reflect.get(rv, "next"));
            Object.seal(rv);
            map.set(obj, rv);
          }

          callbacks.forEach(function(c) {
            try {
              c(rv);
            }
            catch (e) {
              // do nothing
            }
          });
    
          inConstruction.delete(obj);
        }

        return map.get(obj);
      }

      const Alpha = buildReferenceAndSeal(alpha);
      expect(Alpha.next.next).toBe(Alpha);
      expect(Reflect.isExtensible(Alpha)).toBe(false);
      expect(Reflect.isExtensible(Alpha.next)).toBe(false);

      let accessorCount = 0;
      if (isAccessorDescriptor(
            Reflect.getOwnPropertyDescriptor(Alpha, "next")
          ))
        accessorCount++;
      if (isAccessorDescriptor(
            Reflect.getOwnPropertyDescriptor(Alpha.next, "next")
          ))
        accessorCount++;

      expect(accessorCount).toBe(1);
    }
  );

  it(
    "A priority queue can resolve all the data descriptors",
    function() {
      const queue = {
        levels: ["firstCall", "seal", "final"],
        levelMap: new Map()
      };
      
      queue.append = function(level, callback)
      {
        if (!this.levels.includes(level))
          throw new Error("Unknown level");
        if (typeof callback !== "function")
          throw new Error("callback must be a function");
      
        this.levelMap.get(level).push(callback);
      };
      
      queue.next = function()
      {
        const arrays = Array.from(this.levelMap.values());
        const firstArray = arrays.find((array) => array.length > 0);
        if (!firstArray)
          return false;
      
        try
        {
          firstArray.shift()();
        }
        catch (e)
        {
          arrays.forEach((array) => array.length = 0);
          throw e;
        }
        return true;
      };

      {
        Object.freeze(queue.levels);
        queue.levels.forEach((l) => queue.levelMap.set(l, []));
        Object.freeze(queue.levelMap);
        Object.freeze(queue);
      }

      function buildReferenceAndSeal(obj, outparam) {
        refCount++;
        if (refCount > 10)
          throw "Infinite recursion";

        // executing immediately
        if (!map.has(obj)) {
          const rv = {};
          map.set(obj, rv);

          rv.next = pseudoProxy(obj.next);
  
          // Simulating an observer
          {
            if ([alpha, beta].includes(obj)) {
              if (!Reflect.isExtensible(rv))
                throw new Error("rv is not extensible");
              queue.append("seal", function() {
                Object.seal(rv);
              });
            }
          }
        }

        // executing deferred
        queue.append("final", function() {
          const rv = map.get(obj);
          outparam.value = rv;
        });
      }

      function pseudoProxy(obj) {
        const outparam = {
          value: undefined
        };
        queue.append("firstCall", function() {
          buildReferenceAndSeal(obj, outparam);
        });

        while (queue.next()) {
          // do nothing
        }

        return outparam.value;
      }

      const Alpha = pseudoProxy(alpha);
      expect(Alpha.next.next).toBe(Alpha);
      expect(Reflect.isExtensible(Alpha)).toBe(false);
      expect(Reflect.isExtensible(Alpha.next)).toBe(false);

      let accessorCount = 0;
      if (isAccessorDescriptor(
            Reflect.getOwnPropertyDescriptor(Alpha, "next")
          ))
        accessorCount++;
      if (isAccessorDescriptor(
            Reflect.getOwnPropertyDescriptor(Alpha.next, "next")
          ))
        accessorCount++;

      expect(accessorCount).toBe(0);
    }
  );

  it("Returning unpopulated proxies makes a sealed cyclic reference work by only filling in one step of the cycle at a time!", () => {
    const referenceToObject = new WeakMap();
    function buildReference(obj) {
      if (!map.has(obj)) {
        const reference = {};
        map.set(obj, reference);
        referenceToObject.set(reference, obj);

        Reflect.defineProperty(reference, "next", {
          get() {
            fillPropertiesAndSeal(this);
            return this.next;
          },
          enumerable: true,
          configurable: true
        });
      }

      return map.get(obj);
    }

    function fillPropertiesAndSeal(reference) {
      const obj = referenceToObject.get(reference);
      const desc = {
        value: buildReference(obj.next),
        writable: false,
        enumerable: true,
        configurable: false
      };
      Reflect.defineProperty(reference, "next", desc);
      Object.seal(reference);
    }

    const Alpha = buildReference(alpha);
    const Beta = Alpha.next;
    expect(Beta.next).toBe(Alpha);

    expect(Object.isSealed(Alpha)).toBe(true);
    expect(Object.isSealed(Beta)).toBe(true);

    expect(map.get(alpha)).toBe(Alpha);
    expect(map.get(beta)).toBe(Beta);

    expect(referenceToObject.get(Alpha)).toBe(alpha);
    expect(referenceToObject.get(Beta)).toBe(beta);
  });
});

