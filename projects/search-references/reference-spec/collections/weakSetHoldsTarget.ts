import "es-search-references/guest";

{
  const target = { isTarget: true };
  const objectHoldingTarget = new WeakSet<object>([target]);

  const heldValues: readonly object[] = [
    objectHoldingTarget,
  ];

  searchReferences("weakSetHoldsTargetObjectStrongly", target, heldValues, true);
  searchReferences("weakSetHoldsTargetObjectWeakly", target, heldValues, false);

  objectHoldingTarget.delete(target);
  searchReferences("after deleting object key", target, heldValues, false);
}

{
  const target = Symbol("target");
  const objectHoldingTarget = new WeakSet<symbol>([target]);

  const heldValues: readonly object[] = [
    objectHoldingTarget,
  ];

  searchReferences("weakSetHoldsTargetSymbolStrongly", target, heldValues, true);
  searchReferences("weakSetHoldsTargetSymbolWeakly", target, heldValues, false);

  objectHoldingTarget.delete(target);
  searchReferences("after deleting symbol key", target, heldValues, false);
}
