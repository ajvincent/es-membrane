import MultiMixinBuilder from "mixin-decorators";

import {
  StructureKind
} from "ts-morph";

import KindedStructure, {
  type KindedStructureFields
} from "#ts-morph_structures/source/decorators/KindedStructure.mjs";
import StructureBase from "#ts-morph_structures/source/base/StructureBase.mjs";

it("ts-morph structure decorators: KindedStructure", () => {
  const Foo = MultiMixinBuilder<[
    KindedStructureFields<StructureKind.Decorator>
  ], typeof StructureBase>
  (
    [KindedStructure<StructureKind.Decorator>(StructureKind.Decorator)],
    StructureBase
  );

  expect((new Foo).kind).toBe(StructureKind.Decorator);
});
