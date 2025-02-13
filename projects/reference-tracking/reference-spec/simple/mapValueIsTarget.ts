const target = { isTarget: true };
const objectHoldingTarget = new Map<object, object>([[{}, target]]);

const heldValues: readonly object[] = [
  objectHoldingTarget,
];

searchReferences("strongMapHoldsValueStrongly", target, heldValues, true);
searchReferences("strongMapHoldsValueWeakly", target, heldValues, false);
