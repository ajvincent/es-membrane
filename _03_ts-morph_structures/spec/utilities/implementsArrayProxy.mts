import createImplementsArrayProxy, {
  ImplementsArrayHandler,
  getManagerArrayForTypeArray,
  getTypeFromManager,
} from "#ts-morph_structures/source/utilities/ImplementsArrayProxy.mjs";

import type {
  stringOrWriterFunction
} from "#ts-morph_structures/source/types/ts-morph-native.mjs";

import {
  LiteralTypedStructureImpl
} from "#ts-morph_structures/exports.mjs";

describe("ImplementsArray proxy behaves reasonably", () => {
  let implementsArray: stringOrWriterFunction[] | null;
  afterEach(() => implementsArray = null);

  describe("internally, via a direct ProxyHandler interaction,", () => {
    it("has an initial length of 0 for an empty array", () => {
      implementsArray = [];
      expect(ImplementsArrayHandler.get(implementsArray, "length", implementsArray)).toBe(0);
      expect(ImplementsArrayHandler.get(implementsArray, "0", implementsArray)).toBe(undefined);
    });

    it("takes string arguments", () => {
      implementsArray = ["boolean", "string"];
      expect(ImplementsArrayHandler.get(implementsArray, "length", implementsArray)).toBe(2);
      expect(ImplementsArrayHandler.get(implementsArray, "0", implementsArray)).toBe("boolean");
      expect(ImplementsArrayHandler.get(implementsArray, "1", implementsArray)).toBe("string");

      const managerArray = getManagerArrayForTypeArray(implementsArray);
      expect(managerArray.map(getTypeFromManager)).toEqual(implementsArray);
    });

    it("takes a WriterFunction argument", () => {
      const literal = new LiteralTypedStructureImpl("number");
      implementsArray = [literal.writerFunction];

      expect(ImplementsArrayHandler.get(implementsArray, "length", implementsArray)).toBe(1);
      expect(ImplementsArrayHandler.get(implementsArray, "0", implementsArray)).toBe(literal.writerFunction);

      const managerArray = getManagerArrayForTypeArray(implementsArray);
      expect(managerArray.map(manager => manager.typeStructure)).toEqual([literal]);
      expect(managerArray.map(getTypeFromManager)).toEqual(implementsArray);
    });

    it("has normal array methods", () => {
      implementsArray = [];
      const pushMethod = ImplementsArrayHandler.get(
        implementsArray, "push", implementsArray
      ) as stringOrWriterFunction[]["push"];

      expect(typeof pushMethod).toBe("function");
      expect(ImplementsArrayHandler.getOwnPropertyDescriptor(implementsArray, "push")).toBe(undefined);

      pushMethod.call(implementsArray, "number");
      pushMethod.call(implementsArray, "boolean");

      expect(ImplementsArrayHandler.get(implementsArray, "length", implementsArray)).toBe(2);
      expect(ImplementsArrayHandler.get(implementsArray, "0", implementsArray)).toBe("number");
      expect(ImplementsArrayHandler.get(implementsArray, "1", implementsArray)).toBe("boolean");
    });

    it("allows us to set elements of the array", () => {
      const literal = new LiteralTypedStructureImpl("number");

      implementsArray = [];
      ImplementsArrayHandler.set(
        implementsArray, "0", literal.writerFunction, implementsArray
      );

      const managerArray = getManagerArrayForTypeArray(implementsArray);
      expect(managerArray.map(manager => manager.typeStructure)).toEqual([literal]);

      expect(implementsArray).toEqual([literal.writerFunction]);
    });
  });

  describe("as a proxy", () => {
    it("has an initial length of 0 for an empty array", () => {
      implementsArray = createImplementsArrayProxy([]);
      expect(implementsArray.length).toBe(0);
    });

    it("takes string arguments", () => {
      implementsArray = createImplementsArrayProxy(["boolean", "string"]);
      expect(implementsArray).toEqual(["boolean", "string"]);
    });

    it("takes a WriterFunction argument", () => {
      const literal = new LiteralTypedStructureImpl("number");
      implementsArray = createImplementsArrayProxy([literal.writerFunction]);

      expect(implementsArray).toEqual([literal.writerFunction]);

      const managerArray = getManagerArrayForTypeArray(implementsArray);
      expect(managerArray.map(manager => manager.typeStructure)).toEqual([literal]);
      expect(managerArray.map(getTypeFromManager)).toEqual(implementsArray);
    });

    it("has normal array methods", () => {
      implementsArray = createImplementsArrayProxy([]);
      implementsArray.push("number");
      implementsArray.push("boolean");

      expect(implementsArray).toEqual(["number", "boolean"]);
      const managerArray = getManagerArrayForTypeArray(implementsArray);
      expect(managerArray.map(getTypeFromManager)).toEqual(implementsArray);
    });

    it("allows us to set elements of the array", () => {
      const literal = new LiteralTypedStructureImpl("number");

      implementsArray = createImplementsArrayProxy([]);
      implementsArray[0] = literal.writerFunction;

      expect(implementsArray).toEqual([literal.writerFunction]);

      const managerArray = getManagerArrayForTypeArray(implementsArray);
      expect(managerArray.map(manager => manager.typeStructure)).toEqual([literal]);
    });
  });
});
