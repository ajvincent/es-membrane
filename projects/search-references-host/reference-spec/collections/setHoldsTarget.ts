import "es-search-references-guest";

const target = { isTarget: true };
const objectHoldingTarget = new Set<object>([target]);

const heldValues: readonly object[] = [
  objectHoldingTarget,
];

searchReferences("setHoldsTargetStrongly", target, heldValues, true);
