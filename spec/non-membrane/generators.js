describe("Generators", function() {
  let generator;
  function reset() {
    generator = (function* () {
      let count = 0;
      while (true)
      {
        yield { count };
        count++;
      }
    })();
  }
  beforeEach(reset);

  it(
    "returned through getOwnPropertyDescriptor work",
    function() {
      let proxy = new Proxy({}, {
        getOwnPropertyDescriptor: function(target, propertyName) {
          const desc = {
            value: generator,
            writable: true,
            enumerable: true,
            configurable: true
          };

          Reflect.defineProperty(target, propertyName, desc);
          return desc;
        }
      });

      let local = Reflect.getOwnPropertyDescriptor(proxy, "foo").value;
      expect(local.next().value.count).toBe(0);
      expect(local.next().value.count).toBe(1);
      let result = local.return("x");
      expect(result.value).toBe("x");
      expect(result.done).toBe(true);
      result = local.next();
      expect(result.value).toBe(undefined);
      expect(result.done).toBe(true);

      reset();
      local = Reflect.getOwnPropertyDescriptor(proxy, "bar").value;

      expect(local.next().value.count).toBe(0);
      expect(local.next().value.count).toBe(1);
      expect(function() {
        result = local.throw("foo");
      }).toThrow("foo");
      expect(result.value).toBe(undefined);
      expect(result.done).toBe(true);
      result = local.next();
      expect(result.value).toBe(undefined);
      expect(result.done).toBe(true);
    }
  );

  it(
    "returned through get work",
    function() {
      let proxy = new Proxy({}, {
        get: function(target, propertyName) {
          const desc = {
            value: generator,
            writable: true,
            enumerable: true,
            configurable: true
          };

          Reflect.defineProperty(target, propertyName, desc);
          return desc.value;
        }
      });

      let local = proxy.foo;
      expect(local.next().value.count).toBe(0);
      expect(local.next().value.count).toBe(1);
      let result = local.return("x");
      expect(result.value).toBe("x");
      expect(result.done).toBe(true);
      result = local.next();
      expect(result.value).toBe(undefined);
      expect(result.done).toBe(true);

      reset();
      local = proxy.bar;

      expect(local.next().value.count).toBe(0);
      expect(local.next().value.count).toBe(1);
      expect(function() {
        result = local.throw("foo");
      }).toThrow("foo");
      expect(result.value).toBe(undefined);
      expect(result.done).toBe(true);
      result = local.next();
      expect(result.value).toBe(undefined);
      expect(result.done).toBe(true);
    }
  );
});
