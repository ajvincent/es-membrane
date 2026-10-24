import {
  type StatementStructures,
  StructureKind,
  type WriterFunction,
} from "ts-morph";

import getTS_SourceFile from "#utilities/source/getTS_SourceFile.js";

import {
  fixturesDir
} from "../constants.js";

interface ReadonlyStatementedNodeStructure {
  statements?: readonly (string | WriterFunction | StatementStructures)[] | string | WriterFunction;
}

describe("Source statements: ", () => {
  const { statements }: ReadonlyStatementedNodeStructure = getTS_SourceFile(fixturesDir, "sourceStatements.ts").getStructure();

  it("is an array of strings and structures", () => {
    expect(Array.isArray(statements)).toBeTrue();
    if (!Array.isArray(statements))
      return;

    for (let i = 0; i < statements.length; i++) {
      expect(typeof statements[i]).withContext(i.toString()).not.toBe("function");
    }
  });

  if (!Array.isArray(statements))
    return;
  const knownStatements: readonly (string | WriterFunction | StatementStructures)[] = statements;

  it("the first statement is a VariableStatementStructure", () => {
    const firstStatement: string | WriterFunction | StatementStructures = knownStatements[0];
    expect(typeof firstStatement).toBe("object");
    if (typeof firstStatement !== "object")
      return;

    expect(firstStatement.kind).toBe(StructureKind.VariableStatement);
  });

  it("the last statement is an ExportDeclarationStructure", () => {
    const lastStatement: string | WriterFunction | StatementStructures | undefined = knownStatements.at(-1);
    expect(typeof lastStatement).toBe("object");
    if (typeof lastStatement !== "object")
      return;

    expect(lastStatement.kind).toBe(StructureKind.ExportDeclaration);
  });

  it("there are precisely three other statements, all treated as strings", () => {
    expect(knownStatements.length).toBe(5);
    for (let i = 1; i < knownStatements.length - 1; i++) {
      expect(typeof knownStatements[i]).withContext(i.toString()).toBe("string");
    }
  });
});
