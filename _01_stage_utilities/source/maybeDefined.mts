const DEFINED = Symbol("defined?");
type NotDefinedType = { [DEFINED]: false };

type Defined<T> = { [DEFINED]: true } & T;

export type MaybeDefined<T> = NotDefinedType | Defined<T>;

export function markDefined<T>(
  arg: T
) : Defined<T>
{
  (arg as Defined<T>)[DEFINED] = true;
  return arg as Defined<T>;
}

export function assertDefined<T>(
  arg: MaybeDefined<T>
): arg is Defined<T>
{
  if (!arg[DEFINED])
    throw new Error("assertDefined failure");
  return true;
}

export function isNotDefined<T>(arg: MaybeDefined<T>): arg is NotDefinedType
{
  return !arg[DEFINED];
}

export const NOT_DEFINED: MaybeDefined<never> = Object.freeze({ [DEFINED]: false });
