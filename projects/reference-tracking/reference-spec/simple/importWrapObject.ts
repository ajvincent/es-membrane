import wrapObject from "./exportWrapObject.js";

const target = { isTarget: true };

const objectHoldingTarget = wrapObject(target);
const isFirstValue = { isFirstValue: true };
const isLastValue = { isLastValue: true };

const heldValues: readonly object[] = [
  isFirstValue,
  objectHoldingTarget,
  isLastValue,
];

searchReferences("importWrapObject", target, heldValues, true);
