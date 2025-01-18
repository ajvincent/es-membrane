import Jasmine from "jasmine";
export async function runJasmine(pathToConfigFile) {
    const jasmineRunner = new Jasmine();
    jasmineRunner.loadConfigFile(pathToConfigFile);
    jasmineRunner.configureDefaultReporter({
        showColors: true,
    });
    jasmineRunner.exitOnCompletion = false;
    const result = await jasmineRunner.execute();
    if (result.overallStatus !== "passed") {
        throw new Error("jasmine test run failed: " + pathToConfigFile);
    }
}
