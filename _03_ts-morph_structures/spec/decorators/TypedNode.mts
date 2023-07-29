import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "#ts-morph_structures/source/decorators/StructureBase.mjs";

import TypedNode, {
  type TypedNodeStructureFields
} from "#ts-morph_structures/source/decorators/TypedNode.mjs";

import {
  LiteralTypedStructureImpl
} from "#ts-morph_structures/exports.mjs";
import { WriterFunction } from "ts-morph";

it("ts-morph structure decorators: TypedNode", () => {
  const Foo = MultiMixinBuilder<[
    TypedNodeStructureFields
  ], typeof StructureBase>
  (
    [TypedNode],
    StructureBase
  );

  {
    const target = new Foo;
    expect(target.type).toBe(undefined);
    expect(target.typeStructure).toBe(undefined);
  }

  {
    const target = new Foo;
    Foo.cloneType({}, target);
    expect(target.type).toBe(undefined);
    expect(target.typeStructure).toBe(undefined);
  }

  {
    const target = new Foo;
    target.type = "boolean";
    expect(target.type).toBe("boolean");
    expect(target.typeStructure).toBe(undefined);
  }

  {
    const target = new Foo;
    const literal = new LiteralTypedStructureImpl("boolean");
    target.typeStructure = literal;
    expect<WriterFunction>(target.type as WriterFunction).toBe(literal.writerFunction);
    expect(target.typeStructure).toBe(literal);
  }
});
