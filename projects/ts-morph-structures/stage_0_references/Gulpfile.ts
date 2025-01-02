import type {
  TaskFunction,
} from "gulp";

import buildStructuresReference from "./structures/driver.js";

const Tasks: readonly TaskFunction[] = [
  () => buildStructuresReference()
]
export default Tasks;
