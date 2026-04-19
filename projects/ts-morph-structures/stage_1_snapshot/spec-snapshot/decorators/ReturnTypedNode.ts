import MultiMixinBuilder from "mixin-decorators";

import type {
  WriterFunction
} from "ts-morph";

import StructureBase from "#stage_one/prototype-snapshot/base/StructureBase.js";

import ReturnTypedNode, {
  type ReturnTypedNodeStructureFields
} from "#stage_one/prototype-snapshot/decorators/ReturnTypedNode.js";

import {
  LiteralTypedStructureImpl,
  StringTypedStructureImpl,
} from "#stage_one/prototype-snapshot/exports.js";

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
    let target = new Foo;
    target.returnType = "boolean";
    expect(target.returnType).toBe("boolean");
    expect(target.returnTypeStructure).toBeInstanceOf(LiteralTypedStructureImpl);
    expect((target.returnTypeStructure as LiteralTypedStructureImpl)?.stringValue).toBe("boolean");

    // ts-morph is losing return types in cloning structures
    target = Object.assign({}, target);
    expect(target.returnType).withContext("Object.assign test for cloning").toBe("boolean");
  }

  {
    let target = new Foo;
    target.returnTypeStructure = stringTypeStructure;
    expect<WriterFunction>(target.returnType as WriterFunction).toBe(stringTypeStructure.writerFunction);
    expect(target.returnTypeStructure).toBe(stringTypeStructure);

    // ts-morph is losing return types in cloning structures
    target = Object.assign({}, target);
    expect(target.returnType).withContext("Object.assign test for cloning").toBe(stringTypeStructure.writerFunction);
  }
});
