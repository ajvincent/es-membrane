import type {
  TaskFunction
} from "gulp";

import copySnapshot from "./copySnapshot.js";

const Tasks: TaskFunction[] = [
  copySnapshot,
];
export default Tasks;
