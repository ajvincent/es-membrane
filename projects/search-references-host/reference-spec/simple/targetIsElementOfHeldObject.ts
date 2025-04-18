import "es-search-references/guest";

const target = { isTarget: true };

const objectHoldingTarget = { target };
const isFirstValue = { isFirstValue: true };
const isLastValue = { isLastValue: true };

const heldValues: readonly object[] = [
  isFirstValue,
  objectHoldingTarget,
  isLastValue,
];

searchReferences("targetIsElementOfHeldObject", target, heldValues, true);
