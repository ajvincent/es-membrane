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

export default function markDecorated<
  AddedStatic extends object | never,
  AddedInterface extends object | never,
  Base,
  Prototype extends object,
  Arguments extends unknown[] = unknown[],
>
(
  c: Base
) : DecoratedClass<AddedStatic, AddedInterface, Base, Prototype, Arguments>
{
  return c as DecoratedClass<AddedStatic, AddedInterface, Base, Prototype, Arguments>;
}
