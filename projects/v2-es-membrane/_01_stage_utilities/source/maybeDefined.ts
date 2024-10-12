const DEFINED = Symbol("defined?");
type NotDefinedType = { [DEFINED]: false };

type Defined<T extends object> = { [DEFINED]: true } & T;

export type MaybeDefined<T extends object> = NotDefinedType | Defined<T>;

export function markDefined<T extends object>(
  arg: T
) : Defined<T>
{
  (arg as Defined<T>)[DEFINED] = true;
  return arg as Defined<T>;
}

export function assertDefined<T extends object>(
  arg: MaybeDefined<T>
): Defined<T>
{
  if (!arg[DEFINED])
    throw new Error("assertDefined failure");
  return arg;
}

export function assertNotDefined<T extends object>(
  arg: MaybeDefined<T>
): void
{
  if (arg[DEFINED]) {
    throw new Error("assertNotDefined failure");
  }
}

export function isNotDefined<T extends object>(arg: MaybeDefined<T>): arg is NotDefinedType
{
  return !arg[DEFINED];
}

export const NOT_DEFINED: NotDefinedType = Object.freeze({ [DEFINED]: false });
