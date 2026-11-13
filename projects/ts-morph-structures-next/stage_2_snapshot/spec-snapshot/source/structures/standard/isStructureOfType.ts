import {
  FunctionDeclarationImpl,
  MethodDeclarationImpl,
  isStatementStructure,
} from "#stage_two/snapshot/source/exports.js";

it("isStructureOfType exports: isStatementStructure", () => {
  const fnDecl = new FunctionDeclarationImpl();
  expect(isStatementStructure(fnDecl)).toBeTrue();

  const method = new MethodDeclarationImpl(false, "foo");
  expect(isStatementStructure(method)).toBeFalse();
});
