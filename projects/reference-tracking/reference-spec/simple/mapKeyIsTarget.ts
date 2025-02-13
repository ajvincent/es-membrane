const target = { isTarget: true };
const objectHoldingTarget = new Map<object, boolean>([[target, true]]);

const heldValues: readonly object[] = [
  objectHoldingTarget,
];

searchReferences("strongMapHoldsKeyStrongly", target, heldValues, true);
searchReferences("strongMapHoldsKeyWeakly", target, heldValues, false);
