const target = { isTarget: true };
const objectHoldingTarget = new WeakSet<object>([target]);

const heldValues: readonly object[] = [
  objectHoldingTarget,
];

searchReferences("weakSetHoldsTargetStrongly", target, heldValues, true);
searchReferences("weakSetHoldsTargetWeakly", target, heldValues, false);
