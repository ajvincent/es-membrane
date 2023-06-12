import buildBaseStubs from "./buildBaseStubs.mjs";
import buildAspectsDictionary from "#aspect_dictionary/source/buildAspectsDictionary.mjs";

import {
  generatedDir,
} from "./constants.mjs";

export default async function runModule(): Promise<void> {
  // This has to happen first, to clear and recreate the fixtures/generated directory.
  await buildBaseStubs();
  await buildAspectsDictionary(generatedDir)
}
