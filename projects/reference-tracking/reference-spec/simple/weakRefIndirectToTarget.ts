const target = { isTarget: true };
const indirectTarget = [ target ];
const weakRef = new WeakRef<object>(indirectTarget);

const heldValues: readonly object[] = [
  weakRef,
];

searchReferences("weakRefIndirectToTargetHoldsStrongly", target, heldValues, true);
searchReferences("weakRefIndirectToTargetHoldsWeakly", target, heldValues, false);
