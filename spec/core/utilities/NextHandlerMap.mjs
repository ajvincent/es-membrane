import NextHandlerMap from "../../../source/core/utilities/NextHandlerMap.mjs"

import {
  allTraps,
} from "../../../source/core/utilities/shared.mjs";

describe("NextHandlerMap", () => {
  let map;
  beforeEach(() => map = new NextHandlerMap);
  afterEach(() => map = null);

  describe("class", () => {
    it("is frozen", () => {
      expect(Object.isFrozen(NextHandlerMap)).toBe(true);
      expect(Object.isFrozen(NextHandlerMap.prototype)).toBe(true);
    });
  });

  it("instances are not extensible", () => {
    expect(Reflect.isExtensible(map)).toBe(false);
  });

  describe(".setDefault()", () => {
    it("allows setting Reflect for all traps", () => {
      expect(() => {
        allTraps.forEach(trapName => map.setDefault(trapName, Reflect))
      }).not.toThrow();
    });

    it("allows setting a custom ProxyHandler for all traps", () => {
      const handler = jasmine.createSpyObj("handler", allTraps);
      expect(() => {
        allTraps.forEach(trapName => map.setDefault(trapName, handler))
      }).not.toThrow();
    });

    it("cannot execute more than once for each trap", () => {
      const handler = jasmine.createSpyObj("handler", allTraps);
      allTraps.forEach(trapName => map.setDefault(trapName, Reflect));

      allTraps.forEach(trapName => {
        expect(() => {
          map.setDefault(trapName, handler)
        }).toThrowError("A default handler for this trap has been set!");
      });
    });

    it("cannot execute after .lockDefault()", () => {
      const handler = jasmine.createSpyObj("handler", allTraps);
      map.lockDefault();

      expect(() => {
        allTraps.forEach(trapName => map.setDefault(trapName, handler))
      }).toThrowError("The default handler is locked in!");
    });
  });

  describe(".setHandler()", () => {
    const shadowTarget = {};
    it("allows setting Reflect for all traps", () => {
      expect(() => {
        allTraps.forEach(trapName => map.setHandler(trapName, shadowTarget, Reflect))
      }).not.toThrow();
    });

    it("allows setting a custom ProxyHandler for all traps", () => {
      const handler = jasmine.createSpyObj("handler", allTraps);
      expect(() => {
        allTraps.forEach(trapName => map.setHandler(trapName, shadowTarget, handler))
      }).not.toThrow();
    });

    it("is not impacted by .lockDefault()", () => {
      const handler = jasmine.createSpyObj("handler", allTraps);
      map.lockDefault();

      expect(() => {
        allTraps.forEach(trapName => map.setHandler(trapName, shadowTarget, handler))
      }).not.toThrow();
    });

    describe("throws when trying to set the handler as the shadow target for trap", () => {
      allTraps.forEach(trapName => {
        it(trapName, () => {
          const handler = jasmine.createSpyObj("handler", allTraps);
          expect(() => {
            map.setHandler(trapName, map, handler);
          }).toThrowError("You cannot bypass setDefault with the shadow target!");
        });
      });
    });

    describe("throws when trying to set a handler for a shadow target twice using trap", () => {
      allTraps.forEach(trapName => {
        it(trapName, () => {
          const handler = jasmine.createSpyObj("handler", allTraps);
          map.setHandler(trapName, shadowTarget, handler);
          expect(() => {
            map.setHandler(trapName, shadowTarget, handler);
          }).toThrowError("A handler for this trap and shadow target has been set!");

          expect(() => {
            map.setHandler(trapName, shadowTarget, {});
          }).toThrowError("A handler for this trap and shadow target has been set!");
        });
      });
    });
  });

  describe(".invokeNextHandler()", () => {
    const shadowTarget = {};
    const handler1 = jasmine.createSpyObj("handler1", allTraps);
    const handler2 = jasmine.createSpyObj("handler2", allTraps);
    const args = [{}, {}, {}];

    beforeEach(() => {
      allTraps.forEach(trapName => {
        map.setDefault(trapName, handler1);
        handler1[trapName].calls.reset();
        handler2[trapName].calls.reset();
      });
    });

    describe("invokes the default handler's traps when there are no targets recorded: ", () => {
      allTraps.forEach(trapName => {
        it(trapName, () => {
          map.invokeNextHandler(trapName, shadowTarget, ...args);

          expect(handler1[trapName]).toHaveBeenCalledOnceWith(shadowTarget, ...args);
        });
      });
    });

    describe("invokes the shadow target's handler traps when the shadow target is recorded: ", () => {
      allTraps.forEach(trapName => {
        it(trapName, () => {
          map.setHandler(trapName, shadowTarget, handler2);
          map.invokeNextHandler(trapName, shadowTarget, ...args);

          expect(handler2[trapName]).toHaveBeenCalledOnceWith(shadowTarget, ...args);
          expect(handler1[trapName]).toHaveBeenCalledTimes(0);
        });
      });
    });
  });
});
