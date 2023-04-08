import type {
  Class,
} from "type-fest";

export type DecoratedClass<
  AddedStatic extends object,
  AddedPrototype extends object,
  Base,
  Prototype extends object,
  Arguments extends unknown[] = unknown[],
> = Base extends Class<Prototype, Arguments> ?
  (
    Class<Prototype & AddedPrototype, Arguments> &
    Omit<Base, "prototype"> &
    AddedStatic
  ) :
  never;

export type SubclassDecorator<
  AddedStatic extends object,
  AddedPrototype extends object,
  Base,
  Prototype extends object,
  Arguments extends unknown[] = unknown[],
> = Base extends Class<Prototype, Arguments> ?
  (
    value: Base,
    { kind, name }: ClassDecoratorContext
  ) => DecoratedClass<
    AddedStatic, AddedPrototype, Base, Prototype, Arguments
  > :
  never;

export default function markDecorated<
  AddedStatic extends object,
  AddedInterface extends object,
  Base extends Class<Prototype, Arguments>,
  Prototype extends object,
  Arguments extends unknown[] = unknown[],
>
(
  c: Base
) : DecoratedClass<AddedStatic, AddedInterface, Base, Prototype, Arguments>
{
  return c as unknown as DecoratedClass<
    AddedStatic, AddedInterface, Base, Prototype, Arguments
  >;
}
