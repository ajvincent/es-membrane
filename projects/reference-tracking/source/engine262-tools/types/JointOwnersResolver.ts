export type JointOwnersResolver<TrackerType extends object> = (
  this: void,
  childKey: number,
  jointOwnerKeys: readonly number[],
  isStrongOwningReference: boolean,
  tracker: TrackerType,
) => void;
