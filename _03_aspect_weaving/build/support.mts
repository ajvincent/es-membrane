import buildBaseStubs from "./buildBaseStubs.mjs";
//import buildAspectStub from "./buildAspectStub.mjs";

export default async function runModule(): Promise<void> {
  // This has to happen first, to clear and recreate the fixtures/generated directory.
  await buildBaseStubs();

  //await buildAspectStub();
}
