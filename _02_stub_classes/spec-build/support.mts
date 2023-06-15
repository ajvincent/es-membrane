import buildStubClassSet from "./buildStubClassSet.mjs";
import buildHelloWorld from "./wrapInFunction.mjs";

export default
async function runModule() : Promise<void>
{
  await Promise.all([
    buildStubClassSet(),
    buildHelloWorld(),
  ]);
}
