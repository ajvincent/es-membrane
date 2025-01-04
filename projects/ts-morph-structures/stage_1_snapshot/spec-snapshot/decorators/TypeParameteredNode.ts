import MultiMixinBuilder from "mixin-decorators";

import StructureBase from "#stage_one/prototype-snapshot/base/StructureBase.js";

import TypeParameteredNode, {
  TypeParameteredNodeStructureFields,
} from "#stage_one/prototype-snapshot/decorators/TypeParameteredNode.js";

import {
  TypeParameterDeclarationImpl
} from "#stage_one/prototype-snapshot/exports.js";

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
