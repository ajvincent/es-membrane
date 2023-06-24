import type {
  Class
} from "../types/Class.mjs";

import type {
  ClassDecoratorFunction
} from "../types/ClassDecoratorFunction.mjs";

type ClassDecoratorSequence<BaseClassType extends Class<object>> = ReadonlyArray<
  ClassDecoratorFunction<
    BaseClassType,
    boolean | BaseClassType,
    false
  >
>;

function ClassDecoratorSequenceInternal<
  BaseClassType extends Class<object>
>
(
  decorators: ClassDecoratorSequence<BaseClassType>
): ClassDecoratorFunction<BaseClassType, BaseClassType, false>
{
  return function(
    this: void,
    baseClass: BaseClassType,
    context: ClassDecoratorContext<BaseClassType>,
  ) : BaseClassType
  {
    let _class = baseClass;
    for (let i = decorators.length - 1; i >= 0; i--) {
      _class = decorators[i](_class, context) as BaseClassType;
    }
    return _class;
  } as ClassDecoratorFunction<BaseClassType, BaseClassType, false>;
}

export default function applyClassDecorators<
  BaseClassType extends Class<object>
>
(
  decorators: ClassDecoratorSequence<BaseClassType>,
  baseClass: BaseClassType
): BaseClassType
{
  const decoratorFunction = ClassDecoratorSequenceInternal<BaseClassType>(decorators);
  return @decoratorFunction
  class extends baseClass {
  };
}
