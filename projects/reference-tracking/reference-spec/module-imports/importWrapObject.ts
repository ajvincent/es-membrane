import "es-search-references-guest";

import addProperty from "./exportAddProperty.js";

const target = { isTarget: true };
const objectHoldingTarget: Record<"value", object> = addProperty(target);

const heldValues: readonly object[] = [
  objectHoldingTarget,
];

searchReferences("importWrapObject", target, heldValues, true);
