import MultiMixinBuilder from "mixin-decorators";

import type {
  WriterFunction,
} from "ts-morph";

import StructureBase from "#ts-morph_structures/source/base/StructureBase.mjs";

import TypedNode, {
  type TypedNodeStructureFields
} from "#ts-morph_structures/source/decorators/TypedNode.mjs";

import {
  LiteralTypedStructureImpl,
  StringTypedStructureImpl,
} from "#ts-morph_structures/exports.mjs";

it("ts-morph structure decorators: TypedNode", () => {
  const Foo = MultiMixinBuilder<[
    TypedNodeStructureFields
  ], typeof StructureBase>
  (
    [TypedNode],
    StructureBase
  );

  const stringTypeStructure = new StringTypedStructureImpl("NumberStringType");

  {
    const target = new Foo;
    expect(target.type).toBe(undefined);
    expect(target.typeStructure).toBe(undefined);
  }

  {
    const target = new Foo;
    Foo.cloneTyped({}, target);
    expect(target.type).toBe(undefined);
    expect(target.typeStructure).toBe(undefined);
  }

  {
    const target = new Foo;
    target.type = "boolean";
    expect(target.type).toBe("boolean");
    expect(target.typeStructure).toBeInstanceOf(LiteralTypedStructureImpl);
    expect((target.typeStructure as LiteralTypedStructureImpl)?.stringValue).toBe("boolean");
  }

  {
    const target = new Foo;
    target.typeStructure = stringTypeStructure;
    expect<WriterFunction>(target.type as WriterFunction).toBe(stringTypeStructure.writerFunction);
    expect(target.typeStructure).toBe(stringTypeStructure);
  }
});
