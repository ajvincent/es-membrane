import {
  fork,
  spawn,
} from "node:child_process";

import {
  Deferred
} from "./PromiseTypes.js";

export function asyncSpawn(
  pathToExecutable: string,
  cmdLineArgs: readonly string[],
  cwd: string
): Promise<void>
{
  const { promise, resolve, reject } = new Deferred<void>;
  const child = spawn(
    pathToExecutable, cmdLineArgs,
    {
      cwd,
      stdio: ["ignore", "inherit", "inherit", "ipc"],
    }
  );
  child.on('exit', code => code ? reject(code) : resolve());
  return promise;
}

export function asyncFork(
  pathToJSFile: string,
  args: readonly string[],
  cwd: string,
): Promise<void>
{
  const { promise, resolve, reject } = new Deferred<void>;
  const child = fork(pathToJSFile, args, { cwd, stdio: ["ignore", "inherit", "inherit", "ipc"] });
  child.on("exit", code => code ? reject(code) : resolve());
  return promise;
}
