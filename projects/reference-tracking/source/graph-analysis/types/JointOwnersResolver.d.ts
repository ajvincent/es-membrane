export type JointOwnersResolver<
  TrackerType extends object,
  KeyType extends PrefixedNumber<string>,
  Context extends PrefixedNumber<string>
> = (
  this: void,
  childKey: KeyType,
  jointOwnerKeys: readonly KeyType[],
  context: Context,
  tracker: TrackerType,
) => void;
