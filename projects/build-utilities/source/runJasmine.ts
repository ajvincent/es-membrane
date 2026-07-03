import Jasmine from "jasmine";

export async function runJasmine(
  pathToConfigFile: string,
  seed?: number
): Promise<void>
{
  const jasmineRunner = new Jasmine();
  jasmineRunner.loadConfigFile(pathToConfigFile);
  jasmineRunner.configureDefaultReporter({
    showColors: true,
  });
  if (typeof seed === "number") {
    jasmineRunner.seed(seed);
  }
  jasmineRunner.exitOnCompletion = false;

  const result = await jasmineRunner.execute();
  if (result.overallStatus !== "passed") {
    throw new Error("jasmine test run failed: " + pathToConfigFile);
  }
}
