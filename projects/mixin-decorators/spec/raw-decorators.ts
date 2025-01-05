import MixinBase from "../fixtures/MixinBase.js";
import {
  Mixin_XVector
} from "../fixtures/MultiMixinBuilder.js";

/**
 * @remarks
 *
 * This file exists to provide a smoketest, should TypeScript ever natively support mix-in decorators.
 */
it("Class decorators without these utilities do not expose the mix-in properties", () => {
  const X_Values = @Mixin_XVector
  class extends MixinBase {

  };

  const x = new X_Values;
  // @ts-expect-error mixin decorators don't expose the properties of the mixin in the type signature
  expect(x.xLength).toBe(0);
});
