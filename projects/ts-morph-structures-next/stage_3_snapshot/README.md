# Stage 3 snapshot and tests

Like the [stage 2 snapshot](../stage_2_snapshot/README.md), this directory exists to make sure the stage 3 snapshot is viable.  However, "viable" isn't good enough:  the goal is _exactly_ the same code in stage 3 as in stage 2.

The [file hashes tests](./spec-snapshot/fileHashes.ts) are for this purpose.

```typescript
/* This is a brute-force attempt to compare the snapshots we generate.  There are three levels of checks:
 * 1. Do we have the same file names?
 * 2. Do the files have the same source file structure?
 * 3. Do the files hash to exactly the same value?
 *
 * The second one is a strong dogfood test: it uses `getTypeAugmentedStructure` to build the structure,
 * then serializes it for comparison.
 */
```

That's really all there is here... but it is exceedingly difficult to get an exact match of your toolset _using and relying on_ your toolset.  [Which is the entire point of stage 3](https://en.wikipedia.org/wiki/Bootstrapping_(compilers)).
