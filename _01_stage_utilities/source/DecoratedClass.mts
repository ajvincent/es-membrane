import type {
  Class,
} from "type-fest";

import type {
  MixinClass
} from "./MixinClass.mjs";

export type SubclassDecorator<
  AddedStatic extends object,
  AddedPrototype extends object,
  Base extends Class<object>,
> = (
  value: Base,
  context: ClassDecoratorContext,
) => MixinClass<
  AddedStatic, AddedPrototype, Base
>;

export default function markDecorated<
  AddedStatic extends object,
  AddedInterface extends object,
  Base extends Class<object>,
>
(
  c: Base
) : MixinClass<AddedStatic, AddedInterface, Base>
{
  return c as unknown as MixinClass<
    AddedStatic, AddedInterface, Base
  >;
}
