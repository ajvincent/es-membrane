describe(".defineProperty, for descriptors which state properties", function() {
  var inner, outer, revoke, desc, newPropReturns, defineFirst;
  const handler = {
    defineProperty: function(target, propName, desc) {
      var rv;
      if (defineFirst)
        rv = Reflect.defineProperty(target, propName, desc);
      if (propName == "blacklisted")
        return newPropReturns; // but don't actually define it on target.
      if (!defineFirst)
        rv = Reflect.defineProperty(target, propName, desc);
      return rv;
    }
  };

  beforeEach(function() {
    inner = {};
    desc = {
      "value": 2,
      "writable": true,
      "enumerable": true,
    };

    let obj = Proxy.revocable(inner, handler);
    outer = obj.proxy;
    revoke = obj.revoke;
  });

  afterEach(function() {
    revoke();
    inner = null;
    outer = null;
    revoke = null;
    desc = null;
    newPropReturns = null;
    defineFirst = null;
  });

  function defineTest() {
    return Reflect.defineProperty(outer, "blacklisted", desc);
  }

  describe("are non-configurable, ", function() {
    beforeEach(function() {
      desc.configurable = false;
    });

    it(
      "returning true and working must not throw",
      function() {
        newPropReturns = true;
        defineFirst = true;
        expect(defineTest()).toBe(true);
        expect(outer.blacklisted).toBe(2);
      }
    );

    it(
      "returning true without working must throw",
      function() {
        newPropReturns = true;
        defineFirst = false;
        expect(defineTest).toThrow();
        expect(outer.blacklisted).toBe(undefined);
      }
    );

    it(
      "returning false but working must not throw",
      function() {
        newPropReturns = false;
        defineFirst = true;
        expect(defineTest()).toBe(false);
        expect(outer.blacklisted).toBe(2);
      }
    );

    it(
      "returning false without working must not throw",
      function() {
        newPropReturns = false;
        defineFirst = false;
        expect(defineTest()).toBe(false);
        expect(outer.blacklisted).toBe(undefined);
      }
    );
  });

  describe("are configurable,", function() {
    beforeEach(function() {
      desc.configurable = true;
    });

    it(
      "returning true and working must not throw",
      function() {
        newPropReturns = true;
        defineFirst = true;
        expect(defineTest()).toBe(true);
        expect(outer.blacklisted).toBe(2);
      }
    );

    it(
      "returning true without working must not throw",
      function() {
        newPropReturns = true;
        defineFirst = false;
        expect(defineTest()).toBe(true);
        expect(outer.blacklisted).toBe(undefined);
      }
    );

    it(
      "returning false but working must not throw",
      function() {
        newPropReturns = false;
        defineFirst = true;
        expect(defineTest()).toBe(false);
        expect(outer.blacklisted).toBe(2);
      }
    );

    it(
      "returning false without working must not throw",
      function() {
        newPropReturns = false;
        defineFirst = false;
        expect(defineTest()).toBe(false);
        expect(outer.blacklisted).toBe(undefined);
      }
    );
  });
});
