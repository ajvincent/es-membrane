import baseStubs from "./baseStubs.mjs";
import aspectsDictionary from "./aspectsDictionary.mjs";

export default async function runModule(): Promise<void> {
  // This has to happen first, to clear and recreate the fixtures/generated directory.
  await baseStubs();

  await aspectsDictionary();
}
