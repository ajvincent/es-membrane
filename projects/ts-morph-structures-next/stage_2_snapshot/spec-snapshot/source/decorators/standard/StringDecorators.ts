import MultiMixinBuilder from "mixin-decorators";
import { Structures } from "ts-morph";

import {
  COPY_FIELDS,
  type InitializerExpressionableNodeStructureFields,
  InitializerExpressionableNodeStructureMixin,
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
  StructureBase
} from "#stage_two/snapshot/source/internal-exports.js";

it("We can mix and match string decorators", () => {
  const FooBase = MultiMixinBuilder<[
    InitializerExpressionableNodeStructureFields,
    NamedNodeStructureFields,
  ], typeof StructureBase>(
    [
      InitializerExpressionableNodeStructureMixin,
      NamedNodeStructureMixin,
    ],
    StructureBase
  );

  class Foo extends FooBase {
    static copy(source: Foo): Foo {
      const target = new Foo;
      Foo[COPY_FIELDS](source as Foo & Structures, target as Foo & Structures);
      return target;
    }
  }

  const node = new Foo;
  node.name = "myNode";
  node.initializer = "3";

  const TestClone = Foo.copy(node);
  expect(TestClone.name).toBe("myNode");
  expect(TestClone.initializer).toBe("3");
});
