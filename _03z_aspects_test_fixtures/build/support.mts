import aspectsStubs from "./aspectsStubs.mjs";

export default async function runModule(): Promise<void> {
  // This has to happen first, to clear and recreate the fixtures/generated directory.
  await aspectsStubs();
  return Promise.resolve();
}
