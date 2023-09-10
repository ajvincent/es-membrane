export type NumberStringWithTypeParameters<
  StringType extends string,
  NumberType extends number,
  Postfix extends string = "postfix"
> =
{
  repeatForward(s: StringType, n: NumberType): `${string}${Postfix}`;
  //repeatBack(n: NumberType, s: StringType): `${string}${Postfix}`;
};
