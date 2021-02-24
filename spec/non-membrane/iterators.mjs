it(
  "Iterable objects work when returned through a Reflect proxy",
  function() {
    let base, proxy, revoke, obj;
    base = {count: 0};
    base[Symbol.iterator] = function() {
      return {
        next: function() {
          let rv = {
            value: this.count,
            done: this.count > 3
          };
          this.count++;
          return rv;
        },
        get count() {
          return base.count;
        },
        set count(val) {
          base.count = val;
        }
      };
    };

    expect(Array.from(base)).toEqual([0, 1, 2, 3]);
    base.count = 0;

    try {
      obj = Proxy.revocable(base, Reflect);
      proxy  = obj.proxy;
      revoke = obj.revoke;
      let items = Array.from(proxy);
      expect(items).toEqual([0, 1, 2, 3]);
    }
    finally {
      revoke();
    }
  }
);

