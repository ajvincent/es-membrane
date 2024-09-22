import path from "node:path";
import {
  chdir,
  cwd,
} from "node:process";

import {
  series
} from "gulp";

export default function PushAndPopDirSeries(
  dirName: string,
  callbacks: (() => Promise<void>)[]
): ReturnType<typeof series>
{
  let stackDir: string;
  function pushd(): Promise<void> {
    stackDir = cwd();
    chdir(path.normalize(path.join(stackDir, dirName)));
    return Promise.resolve();
  }
  pushd.displayName = `pushd(${dirName})`;

  function popd(): Promise<void> {
    chdir(stackDir);
    return Promise.resolve();
  }
  popd.displayName = `popd(${dirName})`;

  return series(pushd, ...callbacks, popd);
}
