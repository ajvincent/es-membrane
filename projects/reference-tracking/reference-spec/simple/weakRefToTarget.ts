const target = { isTarget: true };
const weakRef = new WeakRef<object>(target);

const heldValues: readonly object[] = [
  weakRef,
];

searchReferences("weakRefToTargetHoldsStrongly", target, heldValues, true);
searchReferences("weakRefToTargetHoldsWeakly", target, heldValues, false);
