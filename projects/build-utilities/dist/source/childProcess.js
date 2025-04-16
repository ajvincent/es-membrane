import { fork, spawn, } from "node:child_process";
import { Deferred } from "./PromiseTypes.js";
export function asyncSpawn(pathToExecutable, cmdLineArgs, cwd) {
    const { promise, resolve, reject } = new Deferred;
    const child = spawn(pathToExecutable, cmdLineArgs, {
        cwd,
        stdio: ["ignore", "inherit", "inherit", "ipc"],
    });
    child.on('exit', code => code ? reject(code) : resolve());
    return promise;
}
export function asyncFork(pathToJSFile, args, cwd) {
    const { promise, resolve, reject } = new Deferred;
    const child = fork(pathToJSFile, args, { cwd, stdio: ["ignore", "inherit", "inherit", "ipc"] });
    child.on("exit", code => code ? reject(code) : resolve());
    return promise;
}
