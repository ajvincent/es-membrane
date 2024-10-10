import path from "node:path";
import { chdir, cwd, } from "node:process";
import { series } from "gulp";
export function PushAndPopDirSeries(dirName, callbacks) {
    let stackDir;
    function pushd() {
        stackDir = cwd();
        chdir(path.normalize(path.join(stackDir, dirName)));
        return Promise.resolve();
    }
    pushd.displayName = `pushd(${dirName})`;
    function popd() {
        chdir(stackDir);
        return Promise.resolve();
    }
    popd.displayName = `popd(${dirName})`;
    return series(pushd, ...callbacks, popd);
}
