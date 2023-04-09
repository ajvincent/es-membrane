import type {
  Class,
} from "type-fest";

export type DecoratedClass<
  AddedStatic extends object,
  AddedPrototype extends object,
  Base extends Class<Prototype>,
  Prototype extends object,
> = (
  Class<Prototype & AddedPrototype> &
  Omit<Base, "prototype"> &
  AddedStatic
);

export type SubclassDecorator<
  AddedStatic extends object,
  AddedPrototype extends object,
  Base extends Class<Prototype>,
  Prototype extends object,
> = (
  value: Base,
  { kind, name }: ClassDecoratorContext
) => DecoratedClass<
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
) : DecoratedClass<AddedStatic, AddedInterface, Base, Prototype>
{
  return c as unknown as DecoratedClass<
    AddedStatic, AddedInterface, Base, Prototype
  >;
}
