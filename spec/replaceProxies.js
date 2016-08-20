describe("replacing proxies tests: ", function() {
  let parts, dryHandler, replacedProxy;
  beforeEach(function() {
    parts = MembraneConceptsViaSampleDoc();
    dryHandler = parts.membrane.getHandlerByField("dry");
    replacedProxy = null;
  });
  afterEach(function() {
    parts = null;
    dryHandler = null;
    replacedProxy = null;
  });

  it("Attempting to replace unknown object in dryHandler fails", function() {
    expect(function() {
      dryHandler.replaceProxy({}, dryHandler);
    }).toThrow();
  });

  it("Attempting to replace wetDocument in dryHandler fails", function() {
    let wetDocument = parts.wet.doc;
    expect(function() {
      dryHandler.replaceProxy(wetDocument, dryHandler);
    }).toThrow();
  });

  let dryObjectTests = function(dryObjectGenerator) {
    return function() {
      let dryObject;
      beforeEach(function() {
        dryObject = dryObjectGenerator(parts);
      });
      afterEach(function() {
        dryObject = null;
      });

      it("with bare object fails", function() {
        expect(function() {
          dryHandler.replaceProxy(dryObject, {});
        }).toThrow();
      });

      it("with Reflect fails", function() {
        expect(function() {
          dryHandler.replaceProxy(dryObject, Reflect);
        }).toThrow();
      });

      it("with object inheriting from Reflect fails", function() {
        let handler = Object.create(Reflect, {
          "thisIsATest": {
            value: true,
            writable: true,
            enumerable: true,
            configurable: true
          }
        });
        expect(function() {
          dryHandler.replaceProxy(dryObject, handler);
        }).toThrow();
      });

      it("handler with dryHandler succeeds", function() {
        replacedProxy = dryHandler.replaceProxy(dryObject, dryHandler);
        let mGN = replacedProxy.membraneGraphName;
        expect(mGN).toBe("dry");
      });

      it("handler with dryHandler a second time fails", function() {
        dryHandler.replaceProxy(dryObject, dryHandler);
        expect(function() {
          dryHandler.replaceProxy(dryObject, dryHandler);
        }).toThrow();
      });

      it("'s previously replaced handler with dryHandler succeeds", function() {
        replacedProxy = dryHandler.replaceProxy(dryObject, dryHandler);
        expect(function() {
          replacedProxy = dryHandler.replaceProxy(replacedProxy, dryHandler);
        }).not.toThrow();
        let mGN = replacedProxy.membraneGraphName;
        expect(mGN).toBe("dry");
      });

      describe("with object inheriting from dryHandler", function() {
        it("directly succeeds", function() {
          let handler = Object.create(dryHandler, {
            "thisIsATest": {
              value: true,
              writable: true,
              enumerable: true,
              configurable: true
            }
          });
          replacedProxy = dryHandler.replaceProxy(dryObject, handler);
          let mGN = replacedProxy.membraneGraphName;
          expect(mGN).toBe("dry");
        });

        it("indirectly succeeds", function() {
          let handler = Object.create(dryHandler, {
            "thisIsATest": {
              value: true,
              writable: true,
              enumerable: true,
              configurable: true
            }
          });
          handler = Object.create(handler, {
            "anotherTest": {
              value: true,
              writable: true,
              enumerable: true,
              configurable: true
            }
          });
          replacedProxy = dryHandler.replaceProxy(dryObject, handler);
          let mGN = replacedProxy.membraneGraphName;
          expect(mGN).toBe("dry");
        });
      });
    };
  };

  describe(
    "Attempting to replace dryDocument",
    dryObjectTests(
      function(parts) {
        return parts.dry.doc;
      }
    )
  );

  describe(
    "Attempting to replace NodeDry.prototype",
    dryObjectTests(
      function(parts) {
        return parts.dry.Node.prototype;
      }
    )
  );
});
