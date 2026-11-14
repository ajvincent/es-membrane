import {
  FunctionDeclarationImpl,
  MethodDeclarationImpl,
  isStatementStructure,
} from "#stage_two/snapshot/source/exports.js";

it("isStructureOfType exports: isStatementStructure (ts-morph native structure types)", () => {
  const fnDecl = new FunctionDeclarationImpl();
  expect(isStatementStructure(fnDecl)).toBeTrue();

  const method = new MethodDeclarationImpl(false, "foo");
  expect(isStatementStructure(method)).toBeFalse();
});
