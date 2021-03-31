import Membrane from "../../source/core/Membrane.mjs";

describe("DistortionsListener", function() {
  var parts;
  beforeEach(function() {
    parts = {
      wet: {},
      dry: {},
      handlers: {
        wet: null,
        dry: null,
      },
      membrane: new Membrane(),
      distortions: null,
      bindDry: function() {
        this.distortions.bindToHandler(this.handlers.dry);
      },
      updateKeys: function() {
        let keys = Reflect.ownKeys(this.wet);
        keys.forEach(function(k) {
          if (k in this.dry)
            return;
          this.dry[k] = this.membrane.convertArgumentToProxy(
            this.handlers.wet,
            this.handlers.dry,
            this.wet[k]
          );
        }, this);
      },
      config: null
    };

    parts.handlers.wet = parts.membrane.getGraphByName(
      "wet", { mustCreate: true }
    );
    parts.handlers.dry = parts.membrane.getGraphByName(
      "dry", { mustCreate: true }
    );

    parts.distortions = parts.membrane.modifyRules.createDistortionsListener();
    parts.config = parts.distortions.sampleConfig(true);
    // disable the set trap
    parts.config.proxyTraps.splice(parts.config.proxyTraps.indexOf("set"), 1);
  });

  afterEach(function() {
    parts = null;
  });

  describe(".prototype.addListener", function() {
    it("for a function as a value", function() {
      parts.wet.A = function() {};
      parts.wet.A.color = "red";
      parts.distortions.addListener(parts.wet.A, "value", parts.config);
      parts.bindDry();
      parts.updateKeys();

      expect(parts.dry.A.color).toBe("red");
      expect(function() {
        parts.dry.A.fontSize = "12px";
      }).toThrow();
      expect("fontSize" in parts.wet.A).toBe(false);
    });

    it("for a function's prototype", function() {
      {
        parts.wet.A = function() {};
        parts.wet.A.prototype.color = "red";
        parts.distortions.addListener(parts.wet.A, "prototype", parts.config);
        parts.bindDry();
        parts.updateKeys();

        expect(parts.dry.A.prototype.color).toBe("red");
        expect(function() {
          parts.dry.A.prototype.fontSize = "12px";
        }).toThrow();
        expect("fontSize" in parts.wet.A.prototype).toBe(false);
      }
    });

    it("for instances of a constructor function", function() {
      {
        parts.wet.A = function() {};
        parts.wet.A.prototype.color = "red";
        parts.wet.a = new parts.wet.A();
        parts.wet.a.fontFamily = "Verdana";
        parts.distortions.addListener(parts.wet.A, "instance", parts.config);
        
        parts.bindDry();
        parts.updateKeys();

        expect(parts.dry.a.color).toBe("red");
        expect(function() {
          parts.dry.a.fontSize = "12px";
        }).toThrow();
        expect("fontSize" in parts.wet.a).toBe(false);
      }
    });

    it("for an iterable list of values", function() {
      parts.wet.A = function() {};
      parts.wet.A.color = "red";

      const B = function() {};
      B.color = "blue";

      const C = function() {};
      C.color = "green";

      const D = function() {};
      D.color = "yellow";

      parts.distortions.addListener(
        [parts.wet.A, B, C, D], "iterable", parts.config
      );
      parts.bindDry();
      parts.updateKeys();

      expect(parts.dry.A.color).toBe("red");
      expect(function() {
        parts.dry.A.fontSize = "12px";
      }).toThrow();
      expect("fontSize" in parts.wet.A).toBe(false);
   });

    it("for a filterable list of values", function() {
      parts.wet.A = function() {};
      parts.wet.A.color = "red";

      const B = function() {};
      B.color = "blue";

      const items = new Set([parts.wet.A, B]);
      const filter = function(meta) {
        return items.has(meta.realTarget);
      };

      parts.distortions.addListener(
        filter, "filter", parts.config
      );
      parts.bindDry();
      parts.updateKeys();

      expect(parts.dry.A.color).toBe("red");
      expect(function() {
        parts.dry.A.fontSize = "12px";
      }).toThrow();
      expect("fontSize" in parts.wet.A).toBe(false);

      parts.wet.B = B;
      items.delete(B);
      parts.updateKeys();

      expect(parts.dry.B.color).toBe("blue");
      expect(function() {
        parts.dry.B.fontSize = "12px";
      }).not.toThrow();
      expect("fontSize" in parts.wet.B).toBe(true);
    });
  });
});
