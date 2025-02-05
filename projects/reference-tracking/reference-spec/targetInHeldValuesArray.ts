const target = { isTarget: true };

const heldValues: readonly object[] = [
  { isFirstValue: true },
  target,
  { isLastValue: true },
];

searchReferences("targetHeldValuesArray", target, heldValues, true);
