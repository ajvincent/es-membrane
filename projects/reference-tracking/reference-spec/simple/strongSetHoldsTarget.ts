const target = { isTarget: true };
const objectHoldingTarget = new Set<object>([target]);

const heldValues: readonly object[] = [
  objectHoldingTarget,
];

searchReferences("strongSetHoldsTargetStrongly", target, heldValues, true);
searchReferences("strongSetHoldsTargetWeakly", target, heldValues, false);
