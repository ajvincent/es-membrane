import type {
  Class,
} from "type-fest";

import type {
  MergeClass
} from "./MergeClass.mjs";

export type SubclassDecorator<
  AddedStatic extends object,
  AddedPrototype extends object,
  Base extends Class<Prototype>,
  Prototype extends object,
> = (
  value: Base,
  context: ClassDecoratorContext,
) => MergeClass<
  AddedStatic, AddedPrototype, Base, Prototype
>;

export default function markDecorated<
  AddedStatic extends object,
  AddedInterface extends object,
  Base extends Class<Prototype>,
  Prototype extends object,
>
(
  c: Base
) : MergeClass<AddedStatic, AddedInterface, Base, Prototype>
{
  return c as unknown as MergeClass<
    AddedStatic, AddedInterface, Base, Prototype
  >;
}
