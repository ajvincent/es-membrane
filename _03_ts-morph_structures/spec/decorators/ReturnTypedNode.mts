import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "#ts-morph_structures/source/decorators/StructureBase.mjs";

import ReturnTypedNode, {
  type ReturnTypedNodeStructureFields
} from "#ts-morph_structures/source/decorators/ReturnTypedNode.mjs";

import {
  LiteralTypedStructureImpl,
  StringTypedStructureImpl,
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

  const stringTypeStructure = new StringTypedStructureImpl("NumberStringType");

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
    expect(target.returnTypeStructure).toBeInstanceOf(LiteralTypedStructureImpl);
    expect((target.returnTypeStructure as LiteralTypedStructureImpl)?.stringValue).toBe("boolean");
  }

  {
    const target = new Foo;
    target.returnTypeStructure = stringTypeStructure;
    expect<WriterFunction>(target.returnType as WriterFunction).toBe(stringTypeStructure.writerFunction);
    expect(target.returnTypeStructure).toBe(stringTypeStructure);
  }
});
