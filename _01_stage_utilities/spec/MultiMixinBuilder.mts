import MultiMixinBuilder, {
  type MultiMixinClass,
} from "../source/MultiMixinBuilder.mjs";

import {
  Mixin_XVector,
  Mixin_YVector,
  type VectorInterfaces,
} from "../fixtures/MultiMixinBuilder.mjs";
import { RequiredState } from "../source/RequiredInitializers.mjs";

it("MultiMixinClass can generate mixins of several classes when we use it as a decorator", () => {
  type MixinFixture = MultiMixinClass<VectorInterfaces>;
  let foundState: RequiredState | undefined;

  function checkRequiredInitializers(
    baseClass: MixinFixture,
    context: ClassDecoratorContext,
  ) : MixinFixture
  {
    void(context);
    return class extends baseClass {
      constructor(...args: unknown[]) {
        super(...args);
        foundState = this.requiredInitializers.getState();
      }
    }
  }


  const VectorMixinClass =
  @checkRequiredInitializers
  class extends MultiMixinBuilder<VectorInterfaces>([
    Mixin_XVector, Mixin_YVector
  ])
  {
    // empty on purpose
  }

  expect(VectorMixinClass.xCoord).toBe(12);
  expect(VectorMixinClass.yCoord).toBe(7);

  const firstVector = new VectorMixinClass;
  expect(firstVector.xLength).toBe(0);
  expect(firstVector.yLength).toBe(4);

  expect(foundState).toBe("initial");
});
