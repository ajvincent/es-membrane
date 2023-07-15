// #region preamble
import type {
  Class
} from "type-fest";

import type {
  StaticAndInstance
} from "./types/StaticAndInstance.mjs";

import type {
  SubclassDecoratorSequence,
} from "./types/SubclassDecorator.mjs";
import type {
  ClassDecoratorFunction
} from "./types/ClassDecoratorFunction.mjs";

import type {
  MultiMixinClass
} from "./types/MultiMixinClass.mjs";

// #endregion preamble

/**
 * Apply decorators to build the mixin class.
 *
 * @typeParam Interfaces - the sequence of static and instance interfaces.
 * @param decorators - a sequence which creates and returns subclasses of MixinBase.  This must match the ordering of Interfaces.
 * @param baseClass - always `MixinBase`.
 * @param context - the class decorator context to forward to each decorator.
 */
function applyAllDecorators<
  Interfaces extends ReadonlyArray<StaticAndInstance<symbol>>,
  Base extends Class<object>,
>
(
  this: void,
  decorators: SubclassDecoratorSequence<Base, Interfaces, false>,
  baseClass: Base,
  context: ClassDecoratorContext,
) : MultiMixinClass<Interfaces, Base>
{
  let _class = baseClass;
  for (let i = decorators.length - 1; i >= 0; i--) {
    _class = decorators[i](_class, context) as Base;
  }
  return _class as MultiMixinClass<Interfaces, Base>;
}

/**
 * Return a ClassDecorator to execute mixin decorators.
 *
 * @typeParam Interfaces - the sequence of static and instance interfaces.
 * @param decorators - a sequence which creates and returns subclasses of MixinBase.  This must match the ordering of Interfaces.
 */
function MixinBuilderInternal<
  Interfaces extends ReadonlyArray<StaticAndInstance<symbol>>,
  Base extends Class<object>,
>
(
  decorators: SubclassDecoratorSequence<Base, Interfaces, false>
) : (_class: Base, context: ClassDecoratorContext) => MultiMixinClass<Interfaces, Base>
{
  return function(
    this: void,
    _class: Base,
    context: ClassDecoratorContext
  ) : MultiMixinClass<Interfaces, Base>
  {
    return applyAllDecorators(decorators, _class, context);
  }
}

/**
 * Build a mixin class inheriting from `MixinBase`.
 *
 * @typeParam Interfaces - the sequence of static and instance interfaces.
 * @param decorators - a sequence which creates and returns subclasses of MixinBase.  This must match the ordering of Interfaces.
 */
function MultiMixinBuilder<
  Interfaces extends ReadonlyArray<StaticAndInstance<symbol>>,
  Base extends Class<object>,
>
(
  decorators: SubclassDecoratorSequence<Base, Interfaces, false>,
  baseClass: Base,
) : MultiMixinClass<Interfaces, Base>
{
  const decoratorFunction = MixinBuilderInternal<
    Interfaces, Base
  >(decorators) as unknown as ClassDecoratorFunction<Base, true, false>;

  return (
    @decoratorFunction
      class extends baseClass {
    }
  ) as unknown as MultiMixinClass<Interfaces, Base>;
}

export default MultiMixinBuilder;
export {
  type MultiMixinClass
};
