import {
  LiteralTypeStructureImpl,
  VariableDeclarationImpl,
} from "#stage_two/snapshot/source/exports.js";

it("new VariableDeclarationImpl(name, typeStructure?, initializer?)", () => {
  let decl = new VariableDeclarationImpl("foo");
  expect(decl.name).toBe("foo");

  decl = new VariableDeclarationImpl("bar", LiteralTypeStructureImpl.get("string"), `"baz"`);
  expect(decl.name).toBe("bar");
  expect(decl.typeStructure).toBe(LiteralTypeStructureImpl.get("string"));
  expect(decl.initializer).toBe(`"baz"`);
});
