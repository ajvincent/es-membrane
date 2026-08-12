import MultiMixinBuilder from "mixin-decorators";

import type {
  WriterFunction
} from "ts-morph";

import StructureBase from "#stage_two/snapshot/source/base/StructureBase.js";

import ReturnTypedNode, {
  type ReturnTypedNodeStructureFields
} from "#stage_two/snapshot/source/decorators/standard/ReturnTypedNodeStructureMixin.js";

import LiteralTypeStructureImpl from "#stage_two/snapshot/source/structures/type/LiteralTypeStructureImpl.js";
import StringTypeStructureImpl from "#stage_two/snapshot/source/structures/type/StringTypeStructureImpl.js";

it("ts-morph structure decorators: ReturnTypedNode", () => {
  const Foo = MultiMixinBuilder<[
    ReturnTypedNodeStructureFields
  ], typeof StructureBase>
  (
    [ReturnTypedNode],
    StructureBase
  );

  const stringTypeStructure = new StringTypeStructureImpl("NumberStringType");

  {
    const target = new Foo;
    expect(target.returnType).toBe(undefined);
    expect(target.returnTypeStructure).toBe(undefined);
  }

  {
    let target = new Foo;
    target.returnType = "boolean";
    expect(target.returnType).toBe("boolean");
    expect(target.returnTypeStructure).toBeInstanceOf(LiteralTypeStructureImpl);
    expect((target.returnTypeStructure as LiteralTypeStructureImpl)?.stringValue).toBe("boolean");

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
