import StubClassSet from "../source/StubClassSet.mjs";
import getConfiguration from "./StubClassSetConfiguration.mjs";

export default
async function buildStubClassSet() : Promise<void>
{
  const configuration = getConfiguration({
    importMeta: import.meta,
    pathToDirectory: "../.."
  });

  const classSet = new StubClassSet(configuration);
  await classSet.run();
}
