describe(
  "A lazy getter can define a property before it is needed", 
  function() {
    const wetInner = { color: "red" };
    const wetOuter = { getInner: () => wetInner };
    var callCount;
    Reflect.defineProperty(wetOuter, "inner", {
      get: () => wetInner,
      enumerable: true,
      configurable: false
    });

    function defineLazyGetter(source, target, propName) {
      const desc = {
        get: function() {
          let sourceDesc = Reflect.getOwnPropertyDescriptor(source, propName);
          if ((sourceDesc !== undefined) && ("value" in sourceDesc)) {
            return desc.set.call(this, sourceDesc.value);
          }

          callCount++;
          expect(Reflect.deleteProperty(target, propName)).toBe(true);
          expect(Reflect.defineProperty(target, propName, sourceDesc)).toBe(true);
          if ((sourceDesc !== undefined) && ("get" in sourceDesc))
            return sourceDesc.get.apply(target);
          return undefined;
        },

        set: function(value) {
          callCount++;
          expect(Reflect.deleteProperty(target, propName)).toBe(true);
          expect(Reflect.defineProperty(target, propName, {
            value,
            writable: true,
            enumerable: true,
            configurable: true,
          })).toBe(true);
          return value;
        },
        enumerable: true,
        configurable: true,
      };
      return Reflect.defineProperty(target, propName, desc);
    }

    describe("on an ordinary object", function() {
      var shadowOuter;
      beforeEach(function() {
        shadowOuter = {};
        callCount = 0;
      });

      afterEach(function() {
        shadowOuter = null;
      });

      it(
        "when the property descriptor is a DataDescriptor",
        function() {
          expect(defineLazyGetter(wetOuter, shadowOuter, "getInner")).toBe(true);
          expect(shadowOuter.getInner()).toBe(wetInner);
          expect(callCount).toBe(1);

          expect(shadowOuter.getInner()).toBe(wetInner);
          expect(callCount).toBe(1);
        }
      );

      it(
        "when the property descriptor is an AccessorDescriptor",
        function() {
          expect(defineLazyGetter(wetOuter, shadowOuter, "inner")).toBe(true);
          expect(shadowOuter.inner).toBe(wetInner);
          expect(callCount).toBe(1);

          expect(shadowOuter.inner).toBe(wetInner);
          expect(callCount).toBe(1);
        }
      );
    });

    describe("on a Reflect proxy", function() {
      var shadowOuter, proxy, revoke;
      beforeEach(function() {
        shadowOuter = {};
        let parts = Proxy.revocable(shadowOuter, Reflect);
        proxy = parts.proxy;
        revoke = parts.revoke;
        callCount = 0;
      });

      afterEach(function() {
        revoke();
        revoke = null;
        proxy = null;
        shadowOuter = null;
      });

      it(
        "when the property descriptor is a DataDescriptor",
        function() {
          expect(defineLazyGetter(wetOuter, proxy, "getInner")).toBe(true);
          expect(proxy.getInner()).toBe(wetInner);
          expect(callCount).toBe(1);

          expect(proxy.getInner()).toBe(wetInner);
          expect(callCount).toBe(1);
        }
      );

      it(
        "when the property descriptor is an AccessorDescriptor",
        function() {
          expect(defineLazyGetter(wetOuter, proxy, "inner")).toBe(true);
          expect(proxy.inner).toBe(wetInner);
          expect(callCount).toBe(1);

          expect(proxy.inner).toBe(wetInner);
          expect(callCount).toBe(1);
        }
      );
    });

    it(
      "on a set of cyclic references objects about to be sealed",
      function() {
        /* This is a difficult but possible problem:  in the Membrane
         * implementation, proxies are created only when needed, via the
         * ProxyNotify API.  If a "proxy listener" wants to seal many proxies,
         * and the underlying target indirectly refers to itself through a chain
         * of property names (a.b.c === a, for example), we can get stuck in a
         * situation where we're called to freeze a proxy for one proxy under
         * creation already.  The result is an identity chicken-and-egg paradox:
         * we can't seal any proxy under creation until all the properties are
         * known to the ObjectGraphHandler, and we can't look up all the
         * properties if a property lookup leads to a proxy creation.
         *
         * If one of the descriptors in the cyclic property reference chain is
         * an accessor descriptor instead of a data descriptor, we're fine.
         *
         * When all of them are data descriptors, that's when we run into
         * trouble, and we must break the chain somewhere.  This requires the
         * problem be broken down into three distinct parts:
         * (1) the proxy handler (where I recursively create and freeze proxies)
         * (2) the lazy getter definition
         * (3) a data structure to track targets of proxies under construction
         */

        // start infrastructure
        //{
        const masterMap = new WeakMap();

        const pHandler = {
          preventExtensions: function(shadowTarget) {
            // We have to define the properties on the shadow target first.
            const target = masterMap.get(shadowTarget).target;
            const keys = Reflect.ownKeys(target);
            keys.forEach(function(propName) {
              defineCyclicLazyGetter(
                target, shadowTarget, propName
              );

              // Trigger the lazy getter so that the property can be sealed.
              Reflect.get(shadowTarget, propName);
            }, this);

            return Reflect.preventExtensions(shadowTarget);
          }
        };

        function defineCyclicLazyGetter(realTarget, shadowTarget, propName) {
          var lockState = "none", lockedValue;
          function setLockedValue(value) {
            lockedValue = value;
            lockState = "finalized";
          }

          const lazyDesc = {
            get: function() {
              if (lockState === "finalized")
                return lockedValue;
              if (lockState === "transient")
                return masterMap.get(shadowTarget).proxy;

              /* When the shadow target is sealed, desc.configurable is not
                 updated.  But the shadow target's properties all get the
                 [[Configurable]] flag removed.  So an attempt to delete the
                 property will fail...
               */
              let current = Reflect.getOwnPropertyDescriptor(
                shadowTarget, propName
              );
              if (!current.configurable)
                throw new Error("lazy getter descriptor is not configurable");

              let sourceDesc = Reflect.getOwnPropertyDescriptor(realTarget, propName);

              /* In this test, we're assuming isDataDescriptor(sourceDesc),
                 since that's the harder one for a cyclic object reference.
                 The real membrane code can easily wrap getters and setters.
              */
              if (typeof sourceDesc.value === "object") {
                if (buildingProxiesFor.has(sourceDesc.value)) {
                  buildingProxiesFor.get(sourceDesc.value).push(setLockedValue);
                  sourceDesc = lazyDesc;
                  delete lazyDesc.set;
                  lockState = "transient";
                }
                else if (masterMap.has(sourceDesc.value))
                  sourceDesc.value = masterMap.get(sourceDesc.value).proxy;
                else
                  sourceDesc.value = buildSealedProxy(sourceDesc.value);
              }

              Reflect.deleteProperty(shadowTarget, propName);
              Reflect.defineProperty(shadowTarget, propName, sourceDesc);
              return sourceDesc.value;
            },

            set: function(newValue) {
              /* When the shadow target is sealed, desc.configurable is not
                 updated.  But the shadow target's properties all get the
                 [[Configurable]] flag removed.  So an attempt to delete the
                 property will fail...
               */
              let current = Reflect.getOwnPropertyDescriptor(
                shadowTarget, propName
              );
              if (!current.configurable)
                throw new Error("lazy getter descriptor is not configurable");

              let sourceDesc = Reflect.getOwnPropertyDescriptor(realTarget, propName);
              if (typeof newValue !== "object")
                sourceDesc.value = newValue;
              else if (masterMap.has(newValue))
                sourceDesc.value = masterMap.get(newValue).proxy;
              else
                sourceDesc.value = buildSealedProxy(newValue);
              Reflect.deleteProperty(shadowTarget, propName);
              Reflect.defineProperty(shadowTarget, propName, sourceDesc);
              return sourceDesc.value;
            },

            enumerable:
              Reflect.getOwnPropertyDescriptor(realTarget, propName).enumerable,

            configurable: true
          };

          Reflect.defineProperty(shadowTarget, propName, lazyDesc);
        }

        const buildingProxiesFor = new WeakMap();

        const revocables = [];
        function buildSealedProxy(obj) {
          const callbacks = [/* callbacks or promises */];
          buildingProxiesFor.set(obj, callbacks);
          try {
            let pMap = {
              target: obj,
              shadow: {}
            };
            let parts = Proxy.revocable(pMap.shadow, pHandler);
            Object.assign(pMap, parts);

            masterMap.set(pMap.target, pMap);
            masterMap.set(pMap.shadow, pMap);
            masterMap.set(pMap.proxy,  pMap);
            revocables.push(pMap.revoke);

            // the real challenge
            Object.seal(pMap.proxy);

            try {
              callbacks.forEach(function(c) { c(pMap.proxy); });
            }
            catch (e) {
              // do nothing
            }
            return pMap.proxy;
          }
          finally {
            buildingProxiesFor.delete(obj);
          }
        }
        //}
        // end infrastructure

        // set up the raw objects
        const a = { objName: "a" },
              b = { objName: "b" },
              c = { objName: "c" };

        a.child = b;
        b.child = c;
        c.grandParent = a;

        const A = buildSealedProxy(a);
        const B = (masterMap.has(b) ? masterMap.get(b).proxy : undefined),
              C = (masterMap.has(c) ? masterMap.get(c).proxy : undefined);

        expect(A.child.child.grandParent === A).toBe(true);
        expect(Object.isSealed(A)).toBe(true);
        expect(typeof B).not.toBe("undefined");
        if (B) {
          expect(B.child.grandParent.child === B).toBe(true);
          expect(Object.isSealed(B)).toBe(true);
        }
        expect(typeof C).not.toBe("undefined");
        if (C) {
          expect(C.grandParent.child.child === C).toBe(true);
          expect(Object.isSealed(C)).toBe(true);
        }
        revocables.forEach(function(r) { r(); });
      }
    );
  }
);
