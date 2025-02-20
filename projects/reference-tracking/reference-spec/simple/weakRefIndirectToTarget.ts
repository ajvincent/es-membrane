const target = { isTarget: true };
const indirectTarget = { target };
const weakRef = new WeakRef<object>(indirectTarget);

const heldValues: readonly object[] = [
  weakRef,
];

searchReferences("WeakRef indirect to target does not hold strongly", target, heldValues, true);
searchReferences("weakRef indirect to target holds weakly", target, heldValues, false);
