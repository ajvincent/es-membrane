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
  MarkCalledBase,
  type MarkCalledFields,
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

    const VectorMixinClassPartial = (class extends MultiMixinBuilder<[YVector], typeof MixinBase>([
      Mixin_YVector
    ], XMixedinClass)
    {
      // empty on purpose
    }) as MultiMixinClass<VectorInterfaces, typeof XMixedinClass>;


    @checkRequiredInitializers
    class VectorMixinClass extends VectorMixinClassPartial {}

    expect(VectorMixinClass.xCoord).toBe(12);
    expect(VectorMixinClass.yCoord).toBe(7);

    const firstVector = new VectorMixinClass;
    expect(firstVector.xLength).toBe(0);
    expect(firstVector.yLength).toBe(4);

    expect(foundState).toBe("initial");
  });

  it("from MixinBase, with protected and public methods (and some very ugly code)", () => {
    type MarkCalledMethods = MarkCalledFields["instanceFields"];

    const VectorMixinClass = (
      class VectorMixinClass

      extends MultiMixinBuilder<VectorInterfaces, typeof MixinBase>([
        Mixin_XVector, Mixin_YVector
      ], MarkCalledBase)

      implements MarkCalledMethods

      {
        public markCalled(this: MarkCalledBase): void {
          this.markCalledInternal();
        }
      }

    ) as MultiMixinClass<[...VectorInterfaces, MarkCalledFields], typeof MarkCalledBase>;

    expect(VectorMixinClass.xCoord).toBe(12);
    expect(VectorMixinClass.yCoord).toBe(7);

    const firstVector = new VectorMixinClass;
    expect(firstVector.xLength).toBe(0);
    expect(firstVector.yLength).toBe(4);

    expect(firstVector.protectedCalled).toBe(false);
    firstVector.markCalled();
    expect(firstVector.protectedCalled).toBe(true);
  });
});
