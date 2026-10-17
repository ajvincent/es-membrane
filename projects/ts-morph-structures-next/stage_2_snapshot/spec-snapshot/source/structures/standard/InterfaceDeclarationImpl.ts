import {
  printStructure,
} from "ts-morph";

import {
  InterfaceDeclarationImpl,
  LiteralTypeStructureImpl,
} from "#stage_two/snapshot/source/exports.js";

describe("InterfaceDeclarationImpl", () => {
  it("serializes extends correctly", () => {
    const decl = new InterfaceDeclarationImpl("CarIfc");
    decl.extendsSet.add(LiteralTypeStructureImpl.get("ColorIfc"));
    decl.extendsSet.add(LiteralTypeStructureImpl.get("ShapeIfc"));

    const result = printStructure(decl);
    expect(result).toBe(`interface CarIfc extends ColorIfc, ShapeIfc {\n}`);
  });
});
