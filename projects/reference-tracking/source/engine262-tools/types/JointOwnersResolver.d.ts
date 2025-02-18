export type JointOwnersResolver<TrackerType extends object> = (
  this: void,
  childKey: number,
  jointOwnerKeys: readonly number[],
  isStrongOwningReference: boolean,
  parentToChildEdgeId: number,
  tracker: TrackerType,
) => void;
