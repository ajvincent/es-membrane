import type {
  Class,
  AbstractClass,
} from "type-fest";

/**
 * Define a derived class type from a base class, with new static and prototype properties.
 *
 * @typeParam AddedStatic - static fields to add to the class type.
 * @typeParam AddedPrototype - fields to add to the class instance
 * @typeParam BaseClass - the class type and static fields already present.  Usually `typeof yourClassName`.
 * @typeParam Prototype - the interfaces for instances of the class.
 * @typeParam Arguments - constructor arguments for the new class type, if you wish to override the default constructor.
 */
export type MergeClass<
  AddedStatic extends object,
  AddedPrototype extends object,
  BaseClass extends Class<Prototype>,
  Prototype extends object,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Arguments extends any[] = ConstructorParameters<BaseClass>,
> = (
  // prototype, added prototype, and constructor
  Class<Prototype & AddedPrototype, Arguments> &

  // omit the original prototype
  Omit<BaseClass, "prototype"> &

  AddedStatic
);

/**
 * Define a derived class type from a base class, with new static and prototype properties.
 *
 * @typeParam AddedStatic - static fields to add to the class type.
 * @typeParam AddedPrototype - fields to add to the class instance
 * @typeParam BaseClass - the class type and static fields already present.  Usually `typeof yourClassName`.
 * @typeParam Prototype - the interfaces for instances of the class.
 * @typeParam Arguments - constructor arguments for the new class type, if you wish to override the default constructor.
 */
export type MergeAbstractClass<
  AddedStatic extends object,
  AddedPrototype extends object,
  BaseClass extends AbstractClass<Prototype>,
  Prototype extends object,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Arguments extends any[] = ConstructorParameters<BaseClass>
> = (
  // prototype, added prototype, and constructor
  AbstractClass<Prototype & AddedPrototype, Arguments> &

  // omit the original prototype
  Omit<BaseClass, "prototype"> &

  AddedStatic
);
