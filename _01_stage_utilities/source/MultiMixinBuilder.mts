import type {
  TupleToUnion,
  UnionToIntersection,
  Simplify,
} from "type-fest";

import type {
  MixinClass
} from "./types/MixinClass.mjs";

import type {
  StaticAndInstance
} from "./types/StaticAndInstance.mjs";

import MixinBase from "./MixinBase.mjs";

import type {
  SubclassDecoratorSequence,
} from "./types/SubclassDecorator.mjs";

/**
 * Build an intersection of either the static interfaces or the instance interfaces from a sequence.
 *
 * @typeParam Interfaces - the sequence of static and instance interfaces.
 * @typeParam Field - the field to extract.
 */
type ExtractFields<
  Interfaces extends ReadonlyArray<StaticAndInstance>,
  Field extends keyof StaticAndInstance
> = Simplify<UnionToIntersection<TupleToUnion<
  { [key in keyof Interfaces]: Interfaces[key][Field] }
>>>;

/**
 * Build an intersection type of a sequence of static and instance interfaces, and the MixinBase class.
 *
 * @typeParam Interfaces - the sequence of static and instance interfaces.
 * @internal - this depends on MixinBase, which is internal to es-membrane.
 */
type MultiMixinClass<
  Interfaces extends ReadonlyArray<StaticAndInstance>,
> = MixinClass<
  ExtractFields<Interfaces, "staticFields">,
  ExtractFields<Interfaces, "instanceFields">,
  typeof MixinBase
>;

/**
 * Apply decorators to build the mixin class.
 *
 * @typeParam Interfaces - the sequence of static and instance interfaces.
 * @param decorators - a sequence which creates and returns subclasses of MixinBase.  This must match the ordering of Interfaces.
 * @param baseClass - always `MixinBase`.
 * @param context - the class decorator context to forward to each decorator.
 *
 * @internal - this depends on MixinBase, which is internal to es-membrane.
 */
function applyAllDecorators<
  Interfaces extends ReadonlyArray<StaticAndInstance>
>
(
  decorators: SubclassDecoratorSequence<Interfaces, false>,
  baseClass: typeof MixinBase,
  context: ClassDecoratorContext,
) : MultiMixinClass<Interfaces>
{
  const _mixedClass = decorators.reduce(
    (_class, decorator) => {
      return decorator(_class, context);
    }, baseClass
  );
  return _mixedClass as MultiMixinClass<Interfaces>;
}

/**
 * Return a ClassDecorator to execute mixin decorators.
 *
 * @typeParam Interfaces - the sequence of static and instance interfaces.
 * @param decorators - a sequence which creates and returns subclasses of MixinBase.  This must match the ordering of Interfaces.
 *
 * @internal - this depends on MixinBase, which is internal to es-membrane.
 */
function MixinBuilderInternal<
  Interfaces extends ReadonlyArray<StaticAndInstance>
>
(
  decorators: SubclassDecoratorSequence<Interfaces, false>
) : (_class: typeof MixinBase, context: ClassDecoratorContext) => MultiMixinClass<Interfaces>
{
  return function(
    _class: typeof MixinBase,
    context: ClassDecoratorContext
  )
  {
    return applyAllDecorators(decorators, _class, context);
  }
}

/**
 * Build a mixin class inheriting from `MixinBase`.
 *
 * @typeParam Interfaces - the sequence of static and instance interfaces.
 * @param decorators - a sequence which creates and returns subclasses of MixinBase.  This must match the ordering of Interfaces.
 *
 * @internal - this depends on MixinBase, which is internal to es-membrane.
 */
function MultiMixinBuilder<
  Interfaces extends ReadonlyArray<StaticAndInstance>
>
(
  decorators: SubclassDecoratorSequence<Interfaces, false>
) : MultiMixinClass<Interfaces>
{
  return (
    @MixinBuilderInternal<Interfaces>(decorators)
    class extends MixinBase {

    }
  ) as MultiMixinClass<Interfaces>;
}

export default MultiMixinBuilder;
export {
  type MultiMixinClass
};
