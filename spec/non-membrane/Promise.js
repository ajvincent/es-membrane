describe("Promises", function() {
  var resolve, reject, builtPromise;
  beforeEach(function() {
    builtPromise = new Promise(function(res, rej) {
      resolve = res;
      reject  = rej;
    });
  });
  afterEach(function() {
    builtPromise = null;
    resolve      = null;
    reject       = null;
  });

  it(
    "may be resolved from Proxy.getOwnPropertyDescriptor synchronously",
    function(done) {
      const handler = {
        getOwnPropertyDescriptor: function(target, propertyName) {
          const rv = {
            value: builtPromise,
            writable: true,
            enumerable: true,
            configurable: true
          };

          Reflect.defineProperty(target, propertyName, rv);
          return rv;
        }
      };

      let proxy = new Proxy({}, handler);
    
      let promise = Reflect.getOwnPropertyDescriptor(proxy, "promise").value;
      promise = promise.then(
        (val) => { expect(val).toBe(true); },
        () => { fail("unexpected promise rejection"); }
      );
      promise = promise.then(done, done);
      resolve(true);
    }
  );

  it(
    "may be resolved from Proxy.get synchronously",
    function(done) {
      const handler = {
        get: function(/* target, propertyName, receiver*/) {
          return builtPromise;
        }
      };

      let proxy = new Proxy({}, handler);
    
      let promise = proxy.promise;
      promise = promise.then(
        (val) => { expect(val).toBe(true); },
        () => { fail("unexpected promise rejection"); }
      );
      promise = promise.then(done, done);
      resolve(true);
    }
  );

  it(
    "may be rejected from Proxy.getOwnPropertyDescriptor synchronously",
    function(done) {
      const handler = {
        getOwnPropertyDescriptor: function(target, propertyName) {
          const rv = {
            value: builtPromise,
            writable: true,
            enumerable: true,
            configurable: true
          };

          Reflect.defineProperty(target, propertyName, rv);
          return rv;
        }
      };

      let proxy = new Proxy({}, handler);
    
      let promise = Reflect.getOwnPropertyDescriptor(proxy, "promise").value;
      promise = promise.then(
        () => { fail("unexpected promise resolved"); },
        (val) => { expect(val).toBe(true); }
      );
      promise = promise.then(done, done);
      reject(true);
    }
  );

  it(
    "may be rejected from Proxy.get synchronously",
    function(done) {
      const handler = {
        get: function(/*target, propertyName, receiver*/) {
          return builtPromise;
        }
      };

      let proxy = new Proxy({}, handler);

      let promise = proxy.promise;
      promise = promise.then(
        () => { fail("unexpected promise resolved"); },
        (val) => { expect(val).toBe(true); }
      );
      promise = promise.then(done, done);
      reject(true);
    }
  );

  /* XXX ajvincent Disabled for Node engine not supporting async/await keywords in version 6.5.0
  it(
    "may be resolved from Proxy.getOwnPropertyDescriptor asynchronously",
    async function() {
      const handler = {
        getOwnPropertyDescriptor: function(target, propertyName) {
          const rv = {
            value: builtPromise,
            writable: true,
            enumerable: true,
            configurable: true
          };

          Reflect.defineProperty(target, propertyName, rv);
          return rv;
        }
      };

      let proxy = new Proxy({}, handler);
      let promise = Reflect.getOwnPropertyDescriptor(proxy, "promise").value;
      resolve(true);
      let value = await promise;
      expect(value).toBe(true);    
    }
  );

  it(
    "may be resolved from Proxy.get asynchronously",
    async function() {
      const handler = {
        get: function() {
          return builtPromise;
        }
      };

      let proxy = new Proxy({}, handler);
      let promise = proxy.promise;
      resolve(true);
      expect(await promise).toBe(true);
    }
  );
  */
});
