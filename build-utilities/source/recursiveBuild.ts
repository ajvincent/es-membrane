import path from "path";
import { chdir, cwd } from 'node:process';

export default async function recursiveBuild(
  dirName: string,
  relativePathToModule: string,
): Promise<void>
{
  const popDir: string = cwd();
  try {
    const pushDir = path.resolve(popDir, dirName);
    chdir(pushDir);
    await import(path.resolve(pushDir, relativePathToModule));
  }
  finally {
    chdir(popDir);
  }
}
