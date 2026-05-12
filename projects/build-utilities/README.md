# What is this?

This is a collection of helper tools which I've crafted over the years to assist with other tasks.  Its purpose is to avoid duplication of build tools I use elsewhere.

- `assertRepoIsClean`: this is for GitHub Actions, where we want to make sure there aren't uncommitted changes from a build.  (Basically, if this fails in a GitHub action, it's telling us we haven't set up git ignores correctly, or we missed a checkin.)
- `childProcess` provides two exports, `asyncFork` and `asyncSpawn`.  Both create promises out of NodeJS's `fork` and `spawn` methods, respsectively, where the final settled promise will be based on the child process's exit code.
- `cleanTSC_output` is for removing TypeScript-emitted files such as `*.js`, `*.d.ts` (where there's a live `.ts` file) and `*.js.map`, so we don't leave build clutter behind.
  - need to write down _why_ I don't just use a separate object directory we can simply `rm -rf` on.
- `constants` is really just to export a shared `monoRepoRoot` file location.
- `hashAllFiles` provides file hashes to ensure we've generated code correctly.  (More accurately, the hashes let us compare generated code in one file against generated code in another.)
- `InvokeTSC` and `InvokeTSC_excludeDirs` invoke the TypeScript compiler.
- `overwriteFileIfDifferent` does exactly what it sounds like.
- `PromiseTypes` provides several promise utilities
  - `Deferred`, which should now be deprecated in favor of `Promise.withResolvers()`.
  - `TimeoutPromise`, which provides a delayed-rejection promise
  - `SingletonPromise`, which appears to be unused (oops)
  - `PromiseAllSequence`, which we can also use to debug parallel promises
  - `PromiseAllParallel`, taking an array of values and a mapper function to call `Promise.all()`
- `readDirsDeep` generates a list of files and directories.  Maybe obsolete with `fsPromises.readdir` now supporting the `recursive` option
- `recursiveGulp` runs `Gulp` in child directories (think recursive Makefile)
  - The `DEBUG_DIR` environment variable allows you to debug a specific directory.
- `runEslint` invokes eslint programatically
- `runJasmine` invokes Jasmine test runners programatically
- `runPrettify` runs Prettier programatically.  I use it on generated code files, to make them readable.
- `synchronizeDirectories` (currently unused) is to ensure a target directory has exactly the same shape as a source directory, without destroying and copying it.  Maybe an existing `rsync` package exists for this.
- `tempDirWithCleanup` creates a temporary directory, a resolve function to start the cleanup, and a `Promise` to await for that cleanup.

## Debugging tip

The `recursiveGulp` function takes a `DEBUG_DIR` environment variable, so that you can specify a directory for which NodeJS should invite debugging.
