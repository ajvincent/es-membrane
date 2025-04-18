import "es-search-references/guest";

const target = { isTarget: true };
const objectHoldingTarget = new WeakMap<object, boolean>([[target, true]]);

const heldValues: readonly object[] = [
  objectHoldingTarget,
];

searchReferences("weakMapHoldsKeyStrongly", target, heldValues, true);
searchReferences("weakMapHoldsKeyWeakly", target, heldValues, false);
