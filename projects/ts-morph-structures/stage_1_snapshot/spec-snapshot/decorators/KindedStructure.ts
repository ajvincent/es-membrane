import MultiMixinBuilder from "mixin-decorators";

import {
  StructureKind
} from "ts-morph";

import KindedStructure, {
  type KindedStructureFields
} from "#stage_one/prototype-snapshot/decorators/KindedStructure.js";
import StructureBase from "#stage_one/prototype-snapshot/base/StructureBase.js";

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
