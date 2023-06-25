import aspectsStubs from "./aspectsStubs.mjs";
import cleanStubs from "./cleanStubsDir.mjs";

export default async function runModule(): Promise<void> {
  // This has to happen first, to clear and recreate the fixtures/generated directory.
  await cleanStubs();

  await Promise.all([
    aspectsStubs(),
  ]);
}
