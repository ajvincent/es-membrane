# Navigating structure trees

Here are some tools for finding your way around.

## Understand the structure API's

Everything I have builds atop the existing [`Structure` interface and derived interfaces](../reference/structure-types.md) from ts-morph.  

You can see at a glance the existing classes' API on a [per-class basis](../api/ts-morph-structures.md).  The class API is necessarily tighter than the interface API, for several reasons.

## forEachAugmentedStructureChild()

The ts-morph project has a [`forEachStructureChild()`](https://ts-morph.com/manipulation/structures#codeforeachstructurechildcode) function, which works very well, as far as it goes.

Since type structures are very much an add-on to the structure hierarchy, I provide a `forEachAugmentedStructureChild()` export with a similar API:

```typescript
declare function forEachAugmentedStructureChild<
  TStructure
>
(
  structureOrArray: ArrayOrValue<StructureImpls | TypeStructures>,
  callback: (child: StructureImpls | TypeStructures) => TStructure | void
): TStructure | undefined;
```

The rules for this function are pretty simple:

1. If we receive an array of structures and/or type structures, call the callback on each element of the array, until the first one returns a truthy value, and return that value.
2. If the structure is a `StructureImpl`, call `forEachStructureChild()` first.  If the return value is truthy, return that value.
3. Call the callback for each child which `forEachStructureCHild()` may have missed.  Return the first truthy value from the callback.
    - this includes type structure children, such as `typeStructure`, `returnTypeStructure`, `implementsSet`, etc.

In all cases, I prefer to visit structure classes before type structure classes.

### What about recursion?

Sorry, no.  This is very much a _shallow_ iterator.  If ts-morph publishes documentation on a recursive version of `forEachStructureChild()`, I will create a similar API for these structure classes.
