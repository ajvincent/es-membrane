import UnionMap from "#stage_three/generation/vanilla/UnionMap.js";
import InterfaceMap from "#stage_three/generation/vanilla/InterfaceMap.js";
import initializeTypes from "#stage_three/generation/vanilla/initializer.js";

import {
  LiteralTypeStructureImpl
} from "#stage_two/snapshot/source/exports.js";

describe("Vanilla types: ", () => {
  beforeAll(initializeTypes);

  it("UnionMap defines everything it should", () => {
    expect(
      UnionMap.get("Structures")?.includes("StatementStructures")
    ).toBe(true);
    expect(
      UnionMap.get("StatementStructures")?.includes("ClassDeclarationStructure")
    ).toBe(true);
  });

  it("InterfaceMap defines everything it should", () => {
    const classDecl = InterfaceMap.get("ClassDeclarationStructure");
    expect(
      classDecl?.properties.find(prop => prop.name === "name")
    ).toBeTruthy();
    expect(
      classDecl?.extendsSet.has(
        LiteralTypeStructureImpl.get("ClassDeclarationSpecificStructure")
      )
    ).toBeTrue();
  });
});
