import getRequiredInitializers, {
  RequiredState
} from "./support/RequiredInitializers.js";

import MultiMixinBuilder, {
  type MultiMixinClass,
} from "../source/MultiMixinBuilder.js";

import MixinBase from "../fixtures/MixinBase.js";

import {
  XVector,
  YVector,
  Mixin_XVector,
  Mixin_YVector,
  type VectorInterfaces,
  MarkCalledBase,
  type MarkCalledFields,
} from "../fixtures/MultiMixinBuilder.js";

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
          foundState = getRequiredInitializers(this).getState();
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

  it("in the right order", () => {
    class MixedClass extends MultiMixinBuilder<VectorInterfaces, typeof MixinBase>([
      Mixin_XVector, Mixin_YVector
    ], MixinBase)
    {
      // empty on purpose
    }

    @Mixin_XVector
    @Mixin_YVector
    class DecoratedClass extends MixinBase {

    }

    const mixedInstance = new MixedClass;
    const decoratedInstance = new DecoratedClass;

    const mixedKeys = Reflect.ownKeys(mixedInstance);
    const decoratedKeys = Reflect.ownKeys(decoratedInstance);
    expect(mixedKeys).toEqual(decoratedKeys);
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
          foundState = getRequiredInitializers(this).getState();
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

    const VectorMixinClassBase = MultiMixinBuilder<VectorInterfaces, typeof MixinBase>([
      Mixin_XVector, Mixin_YVector
    ], MarkCalledBase);

    const VectorMixinClass = (
      class VectorMixinClass extends VectorMixinClassBase implements MarkCalledMethods

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
