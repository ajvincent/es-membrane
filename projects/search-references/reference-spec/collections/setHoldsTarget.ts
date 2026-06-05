import "es-search-references/guest";

{
  const target = { isTarget: true };
  const objectHoldingTarget = new Set<object>([target]);

  const heldValues: readonly object[] = [
    objectHoldingTarget,
  ];

  searchReferences("setHoldsObjectTargetStrongly", target, heldValues, true);

  objectHoldingTarget.delete(target);
  searchReferences("after deleting object key", target, heldValues, false);
}

{
  const target = Symbol("target symbol");
  const objectHoldingTarget = new Set<symbol>([target]);

  const heldValues: readonly object[] = [
    objectHoldingTarget,
  ];

  searchReferences("setHoldsSymbolTargetStrongly", target, heldValues, true);

  objectHoldingTarget.delete(target);
  searchReferences("after deleting symbol key", target, heldValues, false);
}
