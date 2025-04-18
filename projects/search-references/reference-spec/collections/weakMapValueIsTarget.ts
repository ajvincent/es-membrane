import "es-search-references/guest";

const target = { isTarget: true };
const key = { isKey: true };
const objectHoldingTarget = new WeakMap<object, object>([[key, target]]);

const heldValues: object[] = [
  objectHoldingTarget,
];

searchReferences("weakMapHoldsValueStrongly", target, heldValues, true);
searchReferences("weakMapHoldsValueWeakly", target, heldValues, false);

heldValues.push(key);
searchReferences("weakMapAndKeyJointlyHoldValue", target, heldValues, true);
