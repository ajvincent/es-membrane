import {
  InterfaceDeclarationImpl,
  StatementStructureImpls,
  TypeAliasDeclarationImpl,
} from "#stage_two/snapshot/source/exports.js";

it("StructureImplUnions is useable", () => {
  // This is really a compile test.
  const structures: StatementStructureImpls[] = [
    new InterfaceDeclarationImpl("foo"),
    new TypeAliasDeclarationImpl("bar", "string")
  ];
  expect(structures.length).toBe(2);
});
