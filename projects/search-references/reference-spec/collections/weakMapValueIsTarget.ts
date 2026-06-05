import "es-search-references/guest";

{
  const target = { isTarget: true };
  const key = { isKey: true };
  const objectHoldingTarget = new WeakMap<object, object>([[key, target]]);

  const heldValues: object[] = [
    objectHoldingTarget,
  ];

  searchReferences("WeakMap with object key holds value strongly", target, heldValues, true);
  searchReferences("WeakMap with object key holds value weakly", target, heldValues, false);

  heldValues.push(key);
  searchReferences("WeakMap and object key jointly hold value", target, heldValues, true);

  objectHoldingTarget.delete(key);
  searchReferences("after deleting object key", target, heldValues, false);
}

{
  const target = Symbol("target symbol");
  const key = Symbol("key");
  const objectHoldingTarget = new WeakMap<symbol, symbol>([[key, target]]);

  const heldValues: (object | symbol)[] = [
    objectHoldingTarget,
  ];

  searchReferences("WeakMap with symbol key holds value strongly", target, heldValues, true);
  searchReferences("WeakMap with symbol key holds value weakly", target, heldValues, false);

  heldValues.push(key);
  searchReferences("WeakMap and symbol key jointly hold value", target, heldValues, true);

  objectHoldingTarget.delete(key);
  searchReferences("after deleting symbol key", target, heldValues, false);
}
