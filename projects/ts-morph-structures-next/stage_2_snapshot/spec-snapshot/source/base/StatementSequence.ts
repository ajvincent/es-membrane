import {
  /*
  type CodeBlockWriter,
  type WriterFunction,
  */
  VariableDeclarationKind,
} from "ts-morph";

import {
  type AugmentedStatementStructures,
  LiteralTypeStructureImpl,
  type StatementStructureImpls,
  VariableDeclarationImpl,
  VariableStatementImpl,
  type stringOrWriterFunction,
} from "#stage_two/snapshot/source/exports.js";

import {
  StatementsSequence
} from "#stage_two/snapshot/source/base/StatementsSequence.js";

import {
  UnknownStringStatementImpl
} from "#stage_two/snapshot/source/structures/statements/UnknownStringStatementImpl.js";

import {
  serializeWriter
} from "../../support/serializeWriter.js";

it("StatementSequence correctly builds and maintains a proxy", () => {
  const innerStatements: AugmentedStatementStructures[] = [];
  const xConst = new VariableStatementImpl;
  {
    xConst.declarationKind = VariableDeclarationKind.Const;
    const x = new VariableDeclarationImpl("x");
    x.typeStructure = LiteralTypeStructureImpl.get("number");
    x.initializer = "1";
    xConst.declarations.push(x);

    innerStatements.push(xConst);
  }

  const ifString = "if (true) { /* do something */ }";

  const outerStatements: (StatementStructureImpls | stringOrWriterFunction)[] = StatementsSequence.createProxy(innerStatements);
  outerStatements.push(ifString);

  expect(innerStatements.length).toBe(2);
  expect(innerStatements[0]).toBe(xConst);

  expect(innerStatements[1]).toBeInstanceOf(UnknownStringStatementImpl);
  if (innerStatements[1] instanceof UnknownStringStatementImpl)
    expect(serializeWriter(innerStatements[1].writerFunction)).toBe(ifString);

  expect(Array.from(outerStatements)).toEqual([
    xConst,
    ifString
  ]);
});
