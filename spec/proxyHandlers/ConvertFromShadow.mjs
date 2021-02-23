import {
  NWNCDataDescriptor,
  allTraps,
  getRealTarget,
  makeShadowTarget,
} from "../../source/core/sharedUtilities.mjs";
import MembraneProxyHandlers from "../../source/ProxyHandlers/main.mjs";


it("getRealTarget returns the original value for non-shadow targets", function() {
  const target = {};
  expect(getRealTarget(target)).toBe(target);
});

it("getRealTarget returns the original value for shadow targets", function() {
  const target = {};
  const shadow = makeShadowTarget(target);
  expect(typeof shadow).toBe("object");
  expect(shadow).not.toBe(target);
  expect(getRealTarget(shadow)).toBe(target);
});

describe("MembraneProxyHandlers.ConvertFromShadow node proxy handler", function() {
  const ReflectTraps = new Map();
  {
    const recordTarget = function(trapName, ...args) {
      converted = args[0];
      return Reflect[trapName].apply(Reflect, args);
    };
    allTraps.forEach((trapName) => {
      ReflectTraps.set(trapName, recordTarget.bind(null, trapName));
    });
  }

  let list = null,
      target  = null,
      shadow  = null,
      proxy   = null,
      revoke  = null,
      converted = null;

  function buildProxy() {
    let obj = Proxy.revocable(shadow, list);
    proxy = obj.proxy;
    revoke = obj.revoke;
  }

  beforeEach(function() {
    const membraneArg = {membrane: null};
    list = new MembraneProxyHandlers.LinkedList(membraneArg, Reflect);
    let handler = new MembraneProxyHandlers.ConvertFromShadow(membraneArg, "convertFromShadow");
    list.insertNode("head", handler);

    {
      const trace = new MembraneProxyHandlers.LinkedListNode(membraneArg, "trace");
      allTraps.forEach((trapName) => {
        let rv = Reflect.defineProperty(trace, trapName, new NWNCDataDescriptor(ReflectTraps.get(trapName)));
        if (!rv)
          throw new Error("failed to define property");
      });
      list.insertNode("convertFromShadow", trace);
    }

    {
      const corrections = new MembraneProxyHandlers.LinkedListNode(membraneArg, "corrections");
      Reflect.defineProperty(corrections, "preventExtensions", new NWNCDataDescriptor(
        function(shadowTarget) {
          const handler = this.nextHandler(shadowTarget);
          const rv = handler.preventExtensions.apply(handler, arguments);
          Reflect.preventExtensions(shadowTarget);
          return rv;
        }
      ));
      Reflect.defineProperty(corrections, "defineProperty", new NWNCDataDescriptor(
        function(shadowTarget) {
          const handler = this.nextHandler(shadowTarget);
          const rv = handler.defineProperty.apply(handler, arguments);
          Reflect.defineProperty.apply(Reflect, arguments);
          return rv;
        }
      ));
      list.insertNode("head", corrections);
    }

    target = function() {};
    shadow = makeShadowTarget(target);
    converted = null;
  });

  afterEach(function() {
    list = null;
    if (revoke)
      revoke();
    revoke = null;
    proxy = null;
    target = null;
    shadow = null;
    converted = null;
  });

  const extraArgs = new Map();
  {
    extraArgs.set("getPrototypeOf", []);
    extraArgs.set("setPrototypeOf", [{}]);
    extraArgs.set("isExtensible", []);
    extraArgs.set("preventExtensions",[]);
    extraArgs.set("getOwnPropertyDescriptor", ["foo"]);
    extraArgs.set("defineProperty", ["foo", new NWNCDataDescriptor("foo")]);
    extraArgs.set("has", ["foo"]);
    extraArgs.set("get", ["foo"]);
    extraArgs.set("set", ["foo", "foo"]);
    extraArgs.set("deleteProperty", ["foo"]);
    extraArgs.set("ownKeys", []);
    extraArgs.set("apply", [{}, []]);
    extraArgs.set("construct", [[]]);
  }

  allTraps.forEach((trapName) => {
    describe(`on the ${trapName} trap`, function() {
      let args = null;
      beforeEach(function() {
        args = extraArgs.get(trapName).slice(0);
      });

      it("using the raw target", function() {
        args.unshift(target);
        list[trapName].apply(list, args);

        expect(converted).toBe(target);
      });

      it("using the shadow target", function() {
        args.unshift(shadow);
        list[trapName].apply(list, args);

        expect(converted).toBe(target);
      });

      it("using a Proxy", function() {
        buildProxy();
        args.unshift(proxy);
        Reflect[trapName].apply(Reflect, args);

        expect(converted).toBe(target);
      });
    });
  });
});
