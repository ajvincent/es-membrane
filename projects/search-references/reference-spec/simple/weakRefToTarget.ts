import "es-search-references/guest";

{
  const target = { isTarget: true };
  const weakRef = new WeakRef<object>(target);

  const heldValues: readonly object[] = [
    weakRef,
  ];

  searchReferences("WeakRef to target object does not hold strongly", target, heldValues, true);
  searchReferences("WeakRef to target object holds weakly", target, heldValues, false);
}

{
  const target = Symbol("is target");
  const weakRef = new WeakRef<symbol>(target);

  const heldValues: readonly object[] = [
    weakRef,
  ];

  searchReferences("WeakRef to target symbol does not hold strongly", target, heldValues, true);
  searchReferences("WeakRef to target symbol holds weakly", target, heldValues, false);
}
