import aspectsStubs from "./aspectsStubs.mjs";
import cleanStubs from "./cleanStubsDir.mjs";
import buildMethodDecoratedStub from "./methodDecoratedStub.mjs";

export default async function runModule(): Promise<void> {
  // This has to happen first, to clear and recreate the fixtures/generated directory.
  await cleanStubs();

  await Promise.all([
    aspectsStubs(),
    buildMethodDecoratedStub(),
  ]);
}
