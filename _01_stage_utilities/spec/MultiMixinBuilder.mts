import MultiMixinBuilder, {
  type MultiMixinClass,
} from "../source/MultiMixinBuilder.mjs";

import MixinBase from "../source/MixinBase.mjs";

import {
  XVector,
  YVector,
  Mixin_XVector,
  Mixin_YVector,
  type VectorInterfaces,
} from "../fixtures/MultiMixinBuilder.mjs";
import { RequiredState } from "../source/RequiredInitializers.mjs";

describe("MultiMixinBuilder can generate mixins of several classes", () => {
  type MixinFixture = MultiMixinClass<VectorInterfaces, typeof MixinBase>;

  it("directly from MixinBase", () => {
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
    class extends MultiMixinBuilder<VectorInterfaces, typeof MixinBase>([
      Mixin_XVector, Mixin_YVector
    ], MixinBase)
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

  it("from MixinBase, via another mixin", () => {
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

    const XMixedinClass = MultiMixinBuilder<[XVector], typeof MixinBase>([
      Mixin_XVector
    ], MixinBase);

    const VectorMixinClass = (
      @checkRequiredInitializers
      class extends MultiMixinBuilder<[YVector], typeof XMixedinClass>([
        Mixin_YVector
      ], XMixedinClass)
      {
        // empty on purpose
      }
    );

    expect(VectorMixinClass.xCoord).toBe(12);
    expect(VectorMixinClass.yCoord).toBe(7);

    const firstVector = new VectorMixinClass;
    expect(firstVector.xLength).toBe(0);
    expect(firstVector.yLength).toBe(4);

    expect(foundState).toBe("initial");
  });
});
