import "es-search-references/guest";

const target = { isTarget: true };
const key = { isKey: true };
const objectHoldingTarget = new Map<object, object>([[key, target]]);

const heldValues: readonly object[] = [
  objectHoldingTarget,
];

searchReferences("strongMapHoldsValueStrongly", target, heldValues, true);
