import {
  runJasmine
} from "@ajvincent/build-utilities";

async function internalTests(): Promise<void> {
  return runJasmine("./spec/support/jasmine.json");
}

export default internalTests;
