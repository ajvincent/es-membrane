/**
 * @remarks
 * You may be wondering, "why do we need a mixin base class which does nothing?"
 *
 * The answer is "because the TypeScript compiler is really annoying about mixins."
 *
 * Specifically, if a base class of a mixin has a constructor which isn't (...args: any[]),
 * you can't use it to build a generic or typed subclass mixin.  TypeScript throws these (ts2545)
 * errors at you:
 *
 * "mixin class must have a constructor with a single rest parameter of type 'any[]'"
 *
 * This doesn't happen when it's a concrete subclass.  For this reason, no subclass of MixinBase,
 * except final classes, may implement a constructor.
 *
 * Even with this, you can't declare your base class extends a parameterized type:
 *
 * function templatedSecondClass&lt;Base extends typeof RestAnyClass&gt;( baseClass: Base )
 * // Type 'CustomMixinClass & RestAnyClass' is not assignable to type 'InstanceType<Base>'.ts(2322)
 *
 * Yes, this is a big pain in the butt.  The `getRequiredInitializers()` function is a workaround to
 * provide some state saying "Yes, we called specific methods of the class to do what a constructor
 * normally would do."
 *
 * @internal
 */
export default class MixinBase {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  constructor(...args: any[])
  {
    // do nothing
  }
}
Object.freeze(MixinBase.prototype);
