import type {
  Class,
} from "type-fest";

export type DecoratedClass<
  AddedStatic extends object | never,
  AddedPrototype extends object | never,
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
  AddedStatic extends object | never,
  AddedPrototype extends object | never,
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
  AddedStatic extends object | never,
  AddedInterface extends object | never,
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
