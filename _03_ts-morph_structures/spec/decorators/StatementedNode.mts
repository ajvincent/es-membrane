import {
  CodeBlockWriter,
  WriterFunction
} from "ts-morph";

import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "#ts-morph_structures/source/base/StructureBase.mjs";

import StatementedNode, {
  type StatementedNodeStructureFields
} from "#ts-morph_structures/source/decorators/StatementedNode.mjs";

import {
  ExportDeclarationImpl
} from "#ts-morph_structures/exports.mjs";

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
