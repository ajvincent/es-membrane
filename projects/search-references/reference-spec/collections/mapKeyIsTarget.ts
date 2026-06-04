import "es-search-references/guest";

{
  const target = { isTarget: true };
  const value = { isValue: true };
  const objectHoldingTarget = new Map<object, object>([[target, value]]);

  const heldValues: readonly object[] = [
    objectHoldingTarget,
  ];

  searchReferences("strongMapHoldsObjectKeyStrongly", target, heldValues, true);

  objectHoldingTarget.delete(target);
  searchReferences("after deleting object key", target, heldValues, true);
}

{
  const target = Symbol("key");
  const value = { isValue: true };
  const objectHoldingTarget = new Map<symbol, object>([[target, value]]);

  const heldValues: readonly object[] = [
    objectHoldingTarget,
  ];

  searchReferences("strongMapHoldsSymbolKeyStrongly", target, heldValues, true);

  objectHoldingTarget.delete(target);
  searchReferences("after deleting symbol key", target, heldValues, true);
}
