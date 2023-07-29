import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "#ts-morph_structures/source/decorators/StructureBase.mjs";

import ReturnTypedNode, {
  type ReturnTypedNodeStructureFields
} from "#ts-morph_structures/source/decorators/ReturnTypedNode.mjs";

import {
  LiteralTypedStructureImpl
} from "#ts-morph_structures/exports.mjs";
import { WriterFunction } from "ts-morph";

it("ts-morph structure decorators: ReturnTypedNode", () => {
  const Foo = MultiMixinBuilder<[
    ReturnTypedNodeStructureFields
  ], typeof StructureBase>
  (
    [ReturnTypedNode],
    StructureBase
  );

  {
    const target = new Foo;
    expect(target.returnType).toBe(undefined);
    expect(target.returnTypeStructure).toBe(undefined);
  }

  {
    const target = new Foo;
    Foo.cloneReturnTyped({}, target);
    expect(target.returnType).toBe(undefined);
    expect(target.returnTypeStructure).toBe(undefined);
  }

  {
    const target = new Foo;
    target.returnType = "boolean";
    expect(target.returnType).toBe("boolean");
    expect(target.returnTypeStructure).toBe(undefined);
  }

  {
    const target = new Foo;
    const literal = new LiteralTypedStructureImpl("boolean");
    target.returnTypeStructure = literal;
    expect<WriterFunction>(target.returnType as WriterFunction).toBe(literal.writerFunction);
    expect(target.returnTypeStructure).toBe(literal);
  }
});