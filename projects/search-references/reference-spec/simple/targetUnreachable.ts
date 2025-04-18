import "es-search-references/guest";

const target = { isTarget: true };

const isFirstValue = { isFirstValue: true };
const isLastValue = { isLastValue: true };

const heldValues: readonly object[] = [
  isFirstValue,
  isLastValue,
];

searchReferences("targetUnreachable", target, heldValues, true);
