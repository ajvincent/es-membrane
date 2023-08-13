import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "#ts-morph_structures/source/base/StructureBase.mjs";

import TypeParameteredNode, {
  TypeParameteredNodeStructureFields
} from "#ts-morph_structures/source/decorators/TypeParameteredNode.mjs";

import {
  TypeParameterDeclarationImpl
} from "#ts-morph_structures/exports.mjs";

it("ts-morph structure decorators: TypeParameterdNode", () => {
  const Foo = MultiMixinBuilder<[
    TypeParameteredNodeStructureFields
  ], typeof StructureBase>
  (
    [TypeParameteredNode],
    StructureBase
  );

  const target = new Foo;
  expect(target.typeParameters).toEqual([]);

  const decl = new TypeParameterDeclarationImpl("NumberStringType");

  Foo.cloneTypeParametered({
    typeParameters: [
      "boolean",
      decl
    ]
  }, target);

  expect(target.typeParameters).toEqual([
    "boolean", decl
  ]);
});
