import RequiredInitializers from "./RequiredInitializers.mjs";

/** @internal */
export default class MixinBase {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...args: any[])
  {
    // do nothing
  }

  protected readonly requiredInitializers = new RequiredInitializers;
}
Object.freeze(MixinBase.prototype);
