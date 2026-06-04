import "es-search-references/guest";

{
  const target = { isTarget: true };
  const key = { isKey: true };
  const objectHoldingTarget = new Map<object, object>([[key, target]]);

  const heldValues: readonly object[] = [
    objectHoldingTarget,
  ];

  searchReferences("strongMapHoldsObjectValueStrongly", target, heldValues, true);

  objectHoldingTarget.delete(key);
  searchReferences("after deleting object key", target, heldValues, true);
}

{
  const target = Symbol("target");
  const key = Symbol("key");
  const objectHoldingTarget = new Map<symbol, symbol>([[key, target]]);

  const heldValues: readonly object[] = [
    objectHoldingTarget,
  ];

  searchReferences("strongMapHoldsSymbolValueStrongly", target, heldValues, true);

  objectHoldingTarget.delete(key);
  searchReferences("after deleting symbol key", target, heldValues, true);
}
