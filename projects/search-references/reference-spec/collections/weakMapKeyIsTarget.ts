import "es-search-references/guest";

{
  const target = { isTarget: true };
  const objectHoldingTarget = new WeakMap<object, boolean>([[target, true]]);

  const heldValues: readonly object[] = [
    objectHoldingTarget,
  ];

  searchReferences("weakMapHoldsObjectKeyStrongly", target, heldValues, true);
  searchReferences("weakMapHoldsObjectKeyWeakly", target, heldValues, false);

  objectHoldingTarget.delete(target);
  searchReferences("after deleting object key", target, heldValues, false);
}

{
  const target = Symbol("target symbol");
  const objectHoldingTarget = new WeakMap<symbol, boolean>([[target, true]]);

  const heldValues: readonly object[] = [
    objectHoldingTarget,
  ];

  searchReferences("weakMapHoldsSymbolKeyStrongly", target, heldValues, true);
  searchReferences("weakMapHoldsSymbolKeyWeakly", target, heldValues, false);

  objectHoldingTarget.delete(target);
  searchReferences("after deleting symbol key", target, heldValues, false);
}
