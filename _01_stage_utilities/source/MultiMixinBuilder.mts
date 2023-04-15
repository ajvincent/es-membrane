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
 * Yes, this is a big pain in the butt.  The `requiredInitializers` field is a workaround to
 * provide some state saying "Yes, we called specific methods of the class to do what a constructor
 * normally would do."
 */

type ExtractFields<
  Interfaces extends ReadonlyArray<StaticAndInstance>,
  Field extends keyof StaticAndInstance
> = Simplify<UnionToIntersection<TupleToUnion<
  { [key in keyof Interfaces]: Interfaces[key][Field] }
>>>;

export type MultiMixinClass<
  Interfaces extends ReadonlyArray<StaticAndInstance>,
> = MixinClass<
  ExtractFields<Interfaces, "staticFields">,
  ExtractFields<Interfaces, "instanceFields">,
  typeof MixinBase
>;

function OneMixinBuilder<
  Interfaces extends ReadonlyArray<StaticAndInstance>
>
(
  decorators: SubclassDecoratorSequence<Interfaces>,
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

function MixinBuilderInternal<
  Interfaces extends ReadonlyArray<StaticAndInstance>
>
(
  decorators: SubclassDecoratorSequence<Interfaces>
) : (_class: typeof MixinBase, context: ClassDecoratorContext) => MultiMixinClass<Interfaces>
{
  return function runMultiDecorators(
    _class: typeof MixinBase,
    context: ClassDecoratorContext
  ) {
    return OneMixinBuilder(decorators, _class, context);
  }
}

export default function MultiMixinBuilder<
  Interfaces extends ReadonlyArray<StaticAndInstance>
>
(
  decorators: SubclassDecoratorSequence<Interfaces>
) : MultiMixinClass<Interfaces>
{
  const mixinClass = (
    @MixinBuilderInternal<Interfaces>(decorators)
    class extends MixinBase {

    }
  ) as MultiMixinClass<Interfaces>;
  return mixinClass;
}
