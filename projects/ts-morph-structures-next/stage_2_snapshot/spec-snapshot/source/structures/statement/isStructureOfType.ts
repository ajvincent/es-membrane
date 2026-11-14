import {
  UnknownStringStatementImpl,
  isStatementStructure,
} from "#stage_two/snapshot/source/exports.js";

it("isStructureOfType exports: isStatementStructure (ts-morph-structures statements)", () => {
  const voidStatement = new UnknownStringStatementImpl(`void null;`);
  expect(isStatementStructure(voidStatement)).toBeTrue();
});
