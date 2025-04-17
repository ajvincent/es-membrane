# You shouldn't install this project directly

If you are here, you probably want [es-search-references](https://www.npmjs.com/package/es-search-references).

This project exists only for ECMAScript files running inside [engine262](https://www.npmjs.com/package/@engine262/engine262) to provide a `searchReferences` type definition:

```typescript
/**
 * @param resultKey - an unique string key so searches can be distinguished from one another.
 * @param targetValue - the target we're searching for.
 * @param heldValues - the objects and symbols we presume are held strongly
 * @param strongReferencesOnly - true if we should ignore weak references.
 */
declare function searchReferences(
  this: void,
  resultsKey: string,
  targetValue: WeakKey,
  heldValues: readonly WeakKey[],
  strongReferencesOnly: boolean,
): void;
```

In your engine262 scripts, you will include this with the following line:

```typescript
import "es-search-references-guest";
```
