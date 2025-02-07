const target = { isTarget: true };

const differentTargetName = target;
const isFirstValue = { isFirstValue: true };
const isLastValue = { isLastValue: true };

const heldValues: readonly object[] = [
  isFirstValue,
  differentTargetName,
  isLastValue,
];

searchReferences("targetHeldValuesArray", target, heldValues, true);
