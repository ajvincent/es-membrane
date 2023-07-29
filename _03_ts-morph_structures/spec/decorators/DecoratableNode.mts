import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "#ts-morph_structures/source/decorators/StructureBase.mjs";

import DecoratableNode, {
  type DecoratableNodeStructureFields
} from "#ts-morph_structures/source/decorators/DecoratableNode.mjs";

import {
  DecoratorImpl
} from "#ts-morph_structures/exports.mjs";
import { StructureKind } from "ts-morph";

it("ts-morph structure decorators: DecoratableNode", () => {
  const Foo = MultiMixinBuilder<[
    DecoratableNodeStructureFields
  ], typeof StructureBase>
  (
    [DecoratableNode],
    StructureBase
  );

  const target = new Foo;
  expect(target.decorators).toEqual([]);

  Foo.cloneDecoratable({
    decorators: [
      {
        name: "DecoratorNode",
        kind: StructureKind.Decorator,
        arguments: ["foo"],
        typeArguments: ["bar"]
      }
    ]
  }, target);

  const decorator = new DecoratorImpl("DecoratorNode");
  decorator.arguments.push("foo");
  decorator.typeArguments.push("bar");

  expect(target.decorators).toEqual([decorator]);
});
