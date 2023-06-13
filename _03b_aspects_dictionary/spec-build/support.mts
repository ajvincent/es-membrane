import buildAspectsDictionary from "../source/buildAspectsDictionary.mjs";

export default
async function runModule() : Promise<void>
{
  await buildAspectsDictionary({
    importMeta: import.meta,
    pathToDirectory: "../../spec-generated"
  });
}
