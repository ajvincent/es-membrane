import buildBaseStubs from "./buildBaseStubs.mjs";
import buildAspectsDictionarySource from "./buildAspectsDictionary.mjs";

export default async function runModule(): Promise<void> {
  // This has to happen first, to clear and recreate the fixtures/generated directory.
  await buildBaseStubs();

  await buildAspectsDictionarySource();
}
