import "es-search-references/guest";

const target = { isTarget: true };
const weakRef = new WeakRef<object>(target);

const heldValues: readonly object[] = [
  weakRef,
];

searchReferences("WeakRef to target does not hold strongly", target, heldValues, true);
searchReferences("weakRef to target holds weakly", target, heldValues, false);
