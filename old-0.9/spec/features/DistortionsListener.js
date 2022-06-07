/*
import "../docs/dist/es6-modules/Membrane.js";
*/

if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

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

    parts.handlers.wet = parts.membrane.getHandlerByName(
      "wet", { mustCreate: true }
    );
    parts.handlers.dry = parts.membrane.getHandlerByName(
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

      parts.wet.B = function() {};
      parts.wet.B.color = "blue";
      parts.distortions.addListener(parts.wet.B, "value", parts.config);
      parts.distortions.removeListener(parts.wet.B, "value");
      parts.updateKeys();

      expect(parts.dry.B.color).toBe("blue");
      expect(function() {
        parts.dry.B.fontSize = "12px";
      }).not.toThrow();
      expect("fontSize" in parts.wet.B).toBe(true);
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

      {
        parts.wet.B = function() {};
        parts.wet.B.prototype.color = "blue";
        parts.distortions.addListener(parts.wet.B, "prototype", parts.config);
        parts.distortions.removeListener(parts.wet.B, "prototype");
        parts.updateKeys();

        expect(parts.dry.B.prototype.color).toBe("blue");
        expect(function() {
          parts.dry.B.prototype.fontSize = "12px";
        }).not.toThrow();
        expect("fontSize" in parts.wet.B.prototype).toBe(true);
      }

      // This is about using "value" versus "prototype" in the second argument.
      {
        parts.wet.C = function() {};
        parts.wet.C.prototype.color = "green";
        parts.distortions.addListener(
          parts.wet.C.prototype, "value", parts.config
        );
        parts.distortions.removeListener(parts.wet.C, "prototype");
        parts.updateKeys();

        expect(parts.dry.C.prototype.color).toBe("green");
        expect(function() {
          parts.dry.C.prototype.fontSize = "12px";
        }).not.toThrow();
        expect("fontSize" in parts.wet.C.prototype).toBe(true);
      }

      {
        parts.wet.D = function() {};
        parts.wet.D.prototype.color = "yellow";
        parts.distortions.addListener(parts.wet.D, "prototype", parts.config);
        parts.distortions.removeListener(parts.wet.D.prototype, "value");
        parts.updateKeys();

        expect(parts.dry.D.prototype.color).toBe("yellow");
        expect(function() {
          parts.dry.D.prototype.fontSize = "12px";
        }).not.toThrow();
        expect("fontSize" in parts.wet.D.prototype).toBe(true);
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

        parts.distortions.removeListener(parts.wet.A, "instance");
        parts.wet.b = new parts.wet.A();
        parts.wet.b.fontFamily = "Times New Roman";
        parts.updateKeys();

        expect(parts.dry.b.color).toBe("red");
        expect(function() {
          parts.dry.b.fontSize = "12px";
        }).not.toThrow();
        expect("fontSize" in parts.wet.b).toBe(true);
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

      parts.wet.B = B;
      parts.wet.C = C;
      parts.distortions.removeListener([B, C], "iterable");
      parts.updateKeys();

      expect(parts.dry.B.color).toBe("blue");
      expect(function() {
        parts.dry.B.fontSize = "12px";
      }).not.toThrow();
      expect("fontSize" in parts.wet.B).toBe(true);

      expect(parts.dry.C.color).toBe("green");
      expect(function() {
        parts.dry.C.fontSize = "12px";
      }).not.toThrow();
      expect("fontSize" in parts.wet.C).toBe(true);
      
      parts.wet.D = D;
      parts.distortions.removeListener(D, "value");
      parts.updateKeys();

      expect(parts.dry.D.color).toBe("yellow");
      expect(function() {
        parts.dry.D.fontSize = "12px";
      }).not.toThrow();
      expect("fontSize" in parts.wet.D).toBe(true);
    });

    it("for a filterable list of values", function() {
      parts.wet.A = function() {};
      parts.wet.A.color = "red";

      const B = function() {};
      B.color = "blue";

      const items = new Set([parts.wet.A, B]);
      const filter = function(meta) {
        return items.has(meta.target);
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
