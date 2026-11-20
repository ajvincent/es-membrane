import {
  ClassDeclarationImpl,
  FunctionDeclarationImpl,
  MethodDeclarationImpl,
  isStatementStructure,
  isStatementedStructure,
} from "#stage_two/snapshot/source/exports.js";

it("isStructureOfType exports: isStatementStructure (ts-morph native structure types)", () => {
  const fnDecl = new FunctionDeclarationImpl();
  expect(isStatementStructure(fnDecl)).toBeTrue();

  const method = new MethodDeclarationImpl(false, "foo");
  expect(isStatementStructure(method)).toBeFalse();
});

it("isStructureOfType exprots: isStatementedStructure (generated structure type)", () => {
  const fnDecl = new FunctionDeclarationImpl();
  expect(isStatementedStructure(fnDecl)).toBeTrue();
  expect(Array.isArray(fnDecl.statementsSequence)).toBeTrue();

  const method = new MethodDeclarationImpl(false, "foo");
  expect(isStatementedStructure(method)).toBeTrue();

  const classDecl = new ClassDeclarationImpl();
  expect(isStatementedStructure(classDecl)).toBeFalse();
});
