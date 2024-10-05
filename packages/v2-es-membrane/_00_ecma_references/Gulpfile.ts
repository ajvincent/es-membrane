import type {
  TaskFunction,
} from "gulp";

import {
  runJasmine
} from "@ajvincent/build-utilities";

async function internalTests(): Promise<void> {
  return runJasmine("./spec/support/jasmine.json");
}

const Tasks: readonly TaskFunction[] = [
  internalTests,
];

export default Tasks;
