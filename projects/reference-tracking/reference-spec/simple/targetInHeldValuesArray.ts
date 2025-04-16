const objectTarget = { isTarget: true };

const differentTargetName = objectTarget;
const isFirstValue = { isFirstValue: true };
const symbolTarget = Symbol("is symbol target");

const heldValues: readonly WeakKey[] = [
  isFirstValue,
  differentTargetName,
  symbolTarget,
];

searchReferences("target object in held values", objectTarget, heldValues, true);
searchReferences("target symbol in held values", symbolTarget, heldValues, true);
