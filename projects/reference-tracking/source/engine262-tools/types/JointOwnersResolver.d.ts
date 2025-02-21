export type JointOwnersResolver<TrackerType extends object> = (
  this: void,
  childKey: number,
  jointOwnerKeys: readonly number[],
  parentToChildEdgeId: number,
  tracker: TrackerType,
) => void;
