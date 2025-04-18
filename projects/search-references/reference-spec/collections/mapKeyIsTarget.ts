import "es-search-references/guest";

const target = { isTarget: true };
const value = { isValue: true }
const objectHoldingTarget = new Map<object, object>([[target, value]]);

const heldValues: readonly object[] = [
  objectHoldingTarget,
];

searchReferences("strongMapHoldsKeyStrongly", target, heldValues, true);
