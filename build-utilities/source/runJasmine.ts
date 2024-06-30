import { env } from "process";

import { runModule } from "./runModule.js";

import {
  type ModuleSourceDirectory,
  pathToModule,
} from "../internal/AsyncSpecModules.js";

const projectDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../../..",
}

const pathToJasmine = pathToModule(projectDir, "node_modules/jasmine/bin/jasmine.js");

export default async function runJasmine(
  pathToConfigFile: string,
  triggerDebugFlag: string,
): Promise<void>
{
  const nodeJSArgs: string[] = [];
  if (triggerDebugFlag === env.ESM_DEBUG) {
    nodeJSArgs.push("--inspect-brk");
  }

  await runModule(
    pathToJasmine,
    [
      //"--parallel=auto",
      `--config=${pathToConfigFile}`
    ],
    nodeJSArgs
  );
}
