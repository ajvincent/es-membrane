import MultiMixinBuilder from "mixin-decorators";

import {
  CodeBlockWriter,
  WriterFunction,
} from "ts-morph";

import StructureBase from "#stage_one/prototype-snapshot/base/StructureBase.js";

import StatementedNode, {
  type StatementedNodeStructureFields
} from "#stage_one/prototype-snapshot/decorators/StatementedNode.js";

import {
  ExportDeclarationImpl
} from "#stage_one/prototype-snapshot/exports.js";

it("ts-morph structure decorators: StatementedNode", () => {
  const Foo = MultiMixinBuilder<[
    StatementedNodeStructureFields
  ], typeof StructureBase>
  (
    [StatementedNode],
    StructureBase
  );

  const target = new Foo;
  expect(target.statements).toEqual([]);

  Foo.cloneStatemented({}, target);
  expect(target.statements).toEqual([]);

  Foo.cloneStatemented({
    statements: undefined,
  }, target);
  expect(target.statements).toEqual([]);

  Foo.cloneStatemented({
    statements: [],
  }, target);
  expect(target.statements).toEqual([]);

  function voidBarWriter(writer: CodeBlockWriter): void {
    writer.write("void(bar);\n");
  }
  voidBarWriter satisfies WriterFunction;

  const exportDecl = new ExportDeclarationImpl;

  Foo.cloneStatemented({
    statements: ["void(foo);\n", voidBarWriter, exportDecl]
  }, target);
  expect(target.statements).toEqual(
    ["void(foo);\n", voidBarWriter, exportDecl]
  );
  expect(target.statements[1]).toBe(voidBarWriter);
  expect(target.statements[2]).not.toBe(exportDecl);
  expect(target.statements[2]).toBeInstanceOf(ExportDeclarationImpl);
});
