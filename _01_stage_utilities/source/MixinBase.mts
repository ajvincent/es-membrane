class MixinBaseInternal {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...args: any[])
  {
    // do nothing
  }
}
Object.freeze(MixinBaseInternal.prototype);

class MixinBase extends MixinBaseInternal
{
  constructor() {
    super();
  }
}
Object.freeze(MixinBase.prototype);

export default MixinBase;
