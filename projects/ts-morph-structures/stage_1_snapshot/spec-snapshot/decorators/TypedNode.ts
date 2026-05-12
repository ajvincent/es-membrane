import MultiMixinBuilder from "mixin-decorators";

import type {
  WriterFunction,
} from "ts-morph";

import StructureBase from "#stage_one/prototype-snapshot/base/StructureBase.js";

import TypedNode, {
  type TypedNodeStructureFields
} from "#stage_one/prototype-snapshot/decorators/TypedNode.js";

import {
  LiteralTypedStructureImpl,
  StringTypedStructureImpl,
} from "#stage_one/prototype-snapshot/exports.js";

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
    let target = new Foo;
    target.type = "boolean";
    expect(target.type).toBe("boolean");
    expect(target.typeStructure).toBeInstanceOf(LiteralTypedStructureImpl);
    expect((target.typeStructure as LiteralTypedStructureImpl)?.stringValue).toBe("boolean");

    // ts-morph is losing types in cloning structures
    target = Object.assign({}, target);
    expect(target.type).withContext("Object.assign test for cloning").toBe("boolean");
  }

  {
    let target = new Foo;
    target.typeStructure = stringTypeStructure;
    expect<WriterFunction>(target.type as WriterFunction).toBe(stringTypeStructure.writerFunction);
    expect(target.typeStructure).toBe(stringTypeStructure);

    // ts-morph is losing types in cloning structures
    target = Object.assign({}, target);
    expect(target.type).withContext("Object.assign test for cloning").toBe(stringTypeStructure.writerFunction);
  }
});
