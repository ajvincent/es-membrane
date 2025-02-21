# Plan to test reference tracking

1. Rollup the modules under test, with a prefix to force replacing global constructors such as WeakMap, array creation with `new TrackedArray`
  - I've already tested we can overwrite globals: `globalThis.WeakMap = ReferenceTracking.WeakMap;`
2. Provide a function to write, transpile and run test scripts importing the rolled-up module in a forked child process.
  - function returns Promise<boolean>
  - We might need to compile several test scripts

```typescript
// pseudocode
class SpecForker {
  #cwd: string // tempDir
  #sourceDir: string;
  #rollupFileLocation: Promise<string>;

  #definedBeforeAndAfterAll = false;

  /**
   * @param exportsScript - the script to use for rolling up the test code
   */
  constructor(
    directory: string,
    exportsScript: string,
  )
  {
    this.#sourceDir = directory;
    this.#rollupFileLocation = this.#rollupExports(exportsScript);
  }

  async #writeScript(scriptGenerator: (rollupLocation: string) => Promise<string>): Promise<string> {
    const rolledUpLocation = await this.#rollupFileLocation;
    const scriptToWrite = await scriptGenerator(rolledUpLocation);

    /* scriptToWrite must follow these rules:
    - it must be valid syntactic TypeScript
    - it must contain a top-level `function runReferenceTest(): Promise<boolean>`

    The footer will call runReferenceTest and transmit the response via process.send().
    */
    await this.#checkSyntax(scriptToWrite);

    const uniqueFileName = uuid.generate() + ".mts";
    await fs.writeToFile(uniqueFileName, scriptToWrite + SpecForker.footer, { encoding: "utf-8" })
    return uniqueFileName;
  }

  async forkIt(
    description: string,
    expectHeldStrong: boolean,
    contextMessage: string,
    scriptGenerator: (rollupLocation: string) => Promise<string>
  ): Promise<void>
  {
    this.#requireBeforeAndAfterAll();

    const scriptWritten: Promise<string> = this.#writeScript(scriptGenerator)
    it(description, async () => {
      const fileToRun = await scriptWritten;
      await expectAsync(this.#forkScript(fileToRun)).withContext(contextMessage).toBeResolvedTo(expectHeldStrong);
    });
  }

  #requireBeforeAndAfterAll(): void {
    if (this.#definedBeforeAndAfterAll)
      return;
    this.#definedBeforeAndAfterAll = true;
    beforeAll(() => {
    });

    afterAll(() => {
      this.#cleanupTempDir();
    });
  }

  async #forkScript(
    fileToRun: string
  ): Promise<boolean>
  {
    throw new Error("not yet implemented");
  }
}
```