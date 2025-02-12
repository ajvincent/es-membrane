const target = { isTarget: true };

const arrayHoldingTarget = [ target ];
const isFirstValue = { isFirstValue: true };
const isLastValue = { isLastValue: true };

const heldValues: readonly object[] = [
  isFirstValue,
  arrayHoldingTarget,
  isLastValue,
];

searchReferences("targetIsElementOfHeldArray", target, heldValues, true);
