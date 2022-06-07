it(
  "A membrane-like proxy set always returns the same object for a prototype lookup",
  function() {
    "use strict";

    const ShadowKeyMap = new WeakMap();

    /**
     * Define a shadow target, so we can manipulate the proxy independently of the
     * original target.
     *
     * @argument value {Object} The original target.
     *
     * @returns {Object} A shadow target to minimally emulate the real one.
     * @private
     */
    function makeShadowTarget(value) {
      "use strict";
      var rv;
      if (Array.isArray(value))
        rv = [];
      else if (typeof value == "object")
        rv = {};
      else if (typeof value == "function") {
        rv = function() {};
        /* ES7 specification says that functions in strict mode do not have their
         * own "arguments" or "length" properties naturally.  But in non-strict
         * code, V8 adds those properties.  (Mozilla adds them for both strict code
         * and non-strict code, which technically is a spec violation.)  So to make
         * the membrane code work correctly with shadow targets, we start with the
         * minimalist case (strict mode explicitly on), and add missing properties.
         */
        let keys = Reflect.ownKeys(value);
        keys.forEach(function(key) {
          if (Reflect.getOwnPropertyDescriptor(rv))
            return;
          let desc = Reflect.getOwnPropertyDescriptor(value, key);
          Reflect.defineProperty(rv, key, desc);
        });
      }
      else
        throw new Error("Unknown value for makeShadowTarget");
      ShadowKeyMap.set(rv, value);
      return rv;
    }

    function getRealTarget(target) {
      return ShadowKeyMap.has(target) ? ShadowKeyMap.get(target) : target;
    }

    function wetA() {}

    // this doesn't really matter - it's just a way of identifying the prototype 
    Reflect.defineProperty(wetA.prototype, "constructorName", {
      value: "wetA",
      writable: false,
      enumerable: true,
      configurable: false
    });

    const wet_a = new wetA();
    const wet_b = new wetA();

    expect(Reflect.getPrototypeOf(wet_a)).toBe(wetA.prototype);
    expect(Reflect.getPrototypeOf(wet_b)).toBe(wetA.prototype);

    const handler = {
      membrane: {
        dryMap: new WeakMap(),
        prototypeMap: new WeakMap()
      },

      wrapPrototype: function(proto)
      {
        if (!this.membrane.prototypeMap.has(proto))
        {
          let proxy = new Proxy(Reflect, proto);
          this.membrane.prototypeMap.set(proto, proxy);
        }
        return this.membrane.prototypeMap.get(proto);
      },

      getOwnPropertyDescriptor: function(shadow, propertyName)
      {
        const target = getRealTarget(shadow);
        let rv = Reflect.getOwnPropertyDescriptor(target, propertyName);
        if (rv)
        {
          if (Reflect.ownKeys(rv).includes("value"))
            rv.value = this.getProxy(rv.value);
          else
            throw new Error("not supported for this test");

          if (propertyName === "prototype")
            rv.value = this.wrapPrototype(rv.value);

          let oldDesc = Reflect.getOwnPropertyDescriptor(shadow, propertyName);
          if (!oldDesc.configurable)
            rv.configurable = false;

          Reflect.defineProperty(shadow, propertyName, rv);
        }

        return rv;
      },

      get: function(shadow, propertyName)
      {
        const target = getRealTarget(shadow);
        let rv = this.getProxy(Reflect.get(target, propertyName));
        if (propertyName === "prototype")
          rv = this.wrapPrototype(rv);
        if (shadow[propertyName] !== rv)
          shadow[propertyName] = rv;
        return rv;
      },

      getPrototypeOf: function(shadow)
      {
        const target = getRealTarget(shadow);
        const proto = Reflect.getPrototypeOf(target);
        const rv = this.wrapPrototype(this.getProxy(proto));
        Reflect.setPrototypeOf(shadow, rv);
        return rv;
      },

      getProxy: function(wetValue) {
        {
          const t = typeof wetValue;
          if ((t !== "object") && (t !== "function"))
            return wetValue;
        }

        if (!this.membrane.dryMap.has(wetValue))
        {
          const shadow = makeShadowTarget(wetValue);
          const p = new Proxy(shadow, this);
          this.membrane.dryMap.set(wetValue, p);
        }
        return this.membrane.dryMap.get(wetValue);
      }
    };

    const dryA  = handler.getProxy(wetA);
    const dry_a = handler.getProxy(wet_a);
    const dry_b = handler.getProxy(wet_b);

    const dryProto = dryA.prototype;
    expect(dryProto).not.toBe(wetA.prototype);

    expect(Reflect.getPrototypeOf(dry_a)).toBe(dryProto);
    expect(dryA.prototype).toBe(dryProto);
    expect(Reflect.getPrototypeOf(dry_b)).toBe(dryProto);

    Object.seal(dry_a);
    expect(Reflect.getPrototypeOf(dry_a)).toBe(dryProto);
    expect(dryA.prototype).toBe(dryProto);
    expect(Reflect.getPrototypeOf(dry_b)).toBe(dryProto);

    Object.seal(dryA);
    expect(Reflect.getPrototypeOf(dry_a)).toBe(dryProto);
    expect(dryA.prototype).toBe(dryProto);
    expect(Reflect.getPrototypeOf(dry_b)).toBe(dryProto);

    Object.seal(dry_b);
    expect(Reflect.getPrototypeOf(dry_a)).toBe(dryProto);
    expect(dryA.prototype).toBe(dryProto);
    expect(Reflect.getPrototypeOf(dry_b)).toBe(dryProto);

    Object.freeze(dry_a);
    expect(Reflect.getPrototypeOf(dry_a)).toBe(dryProto);
    expect(dryA.prototype).toBe(dryProto);
    expect(Reflect.getPrototypeOf(dry_b)).toBe(dryProto);

    Object.freeze(dryA);
    expect(Reflect.getPrototypeOf(dry_a)).toBe(dryProto);
    expect(dryA.prototype).toBe(dryProto);
    expect(Reflect.getPrototypeOf(dry_b)).toBe(dryProto);

    Object.freeze(dry_b);
    expect(Reflect.getPrototypeOf(dry_a)).toBe(dryProto);
    expect(dryA.prototype).toBe(dryProto);
    expect(Reflect.getPrototypeOf(dry_b)).toBe(dryProto);
  }
);
