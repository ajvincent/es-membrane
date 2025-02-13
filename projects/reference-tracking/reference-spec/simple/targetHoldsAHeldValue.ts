const isFirstValue = { isFirstValue: true };
const isLastValue = { isLastValue: true };

const heldValues: readonly object[] = [
  isFirstValue,
  isLastValue,
];

const target = { isTarget: true, heldValues };

searchReferences("target holds a held value", target, heldValues, true);
