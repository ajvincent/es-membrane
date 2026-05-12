import MultiMixinBuilder from "mixin-decorators";

import type {
  WriterFunction,
} from "ts-morph";

import StructureBase from "#stage_two/snapshot/source/base/StructureBase.js";

import TypedNode, {
  type TypedNodeStructureFields
} from "#stage_two/snapshot/source/decorators/standard/TypedNodeStructureMixin.js";

import LiteralTypeStructureImpl from "#stage_two/snapshot/source/structures/type/LiteralTypeStructureImpl.js";
import StringTypeStructureImpl from "#stage_two/snapshot/source/structures/type/StringTypeStructureImpl.js";

it("ts-morph structure decorators: TypedNode", () => {
  const Foo = MultiMixinBuilder<[
    TypedNodeStructureFields
  ], typeof StructureBase>
  (
    [TypedNode],
    StructureBase
  );

  const stringTypeStructure = new StringTypeStructureImpl("NumberStringType");

  {
    const target = new Foo;
    expect(target.type).toBe(undefined);
    expect(target.typeStructure).toBe(undefined);
  }

  {
    let target = new Foo;
    target.type = "boolean";
    expect(target.type).toBe("boolean");
    expect(target.typeStructure).toBeInstanceOf(LiteralTypeStructureImpl);
    expect((target.typeStructure as LiteralTypeStructureImpl)?.stringValue).toBe("boolean");

    // ts-morph is losing return types in cloning structures
    target = Object.assign({}, target);
    expect(target.type).withContext("Object.assign test for cloning").toBe("boolean");
  }

  {
    let target = new Foo;
    target.typeStructure = stringTypeStructure;
    expect<WriterFunction>(target.type as WriterFunction).toBe(stringTypeStructure.writerFunction);
    expect(target.typeStructure).toBe(stringTypeStructure);

    // ts-morph is losing return types in cloning structures
    target = Object.assign({}, target);
    expect(target.type).withContext("Object.assign test for cloning").toBe(stringTypeStructure.writerFunction);
  }
});
