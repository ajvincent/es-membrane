import "es-search-references-guest";

const target = { isTarget: true };
const symbolKey = Symbol("This is a symbol");
const objectHoldingTarget = { [symbolKey]: target };

const heldValues: readonly object[] = [
  objectHoldingTarget,
];

searchReferences("symbolKeyHoldsTarget", target, heldValues, true);
