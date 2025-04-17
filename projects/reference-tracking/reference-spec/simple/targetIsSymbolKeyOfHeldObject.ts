import "es-search-references-guest";

const target = Symbol("is target");

const isTailValue = { isTailValue: true };
const objectHoldingTarget = { [target]: isTailValue };

const heldValues: readonly object[] = [
  objectHoldingTarget,
];

searchReferences("target is symbol key of held object", target, heldValues, true);
