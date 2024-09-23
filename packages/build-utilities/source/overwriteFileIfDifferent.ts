import fs from "node:fs/promises";

export async function overwriteFileIfDifferent(
  isContents: boolean,
  sourceOrContents: string,
  destination: string,
  mtime: Date,
): Promise<void>
{
  let sourceModified: Date;

  if (isContents === false) {
    sourceModified = (await fs.stat(sourceOrContents)).mtime;
    sourceOrContents = await fs.readFile(sourceOrContents, { encoding: "utf-8" });
  }

  let destStats: Awaited<ReturnType<typeof fs.stat>>;
  let destContents: string | undefined, destFileFound = true;
  try {
    destStats = await fs.stat(destination);
    destContents = await fs.readFile(destination, { encoding: "utf-8" });
  }
  catch (ex) {
    destFileFound = false;
  }

  const contentsMatch = sourceOrContents === destContents;
  if (destFileFound && contentsMatch) {
    await fs.utimes(destination, destStats!.atime, destStats!.mtime)
    return;
  }

  await fs.writeFile(destination, sourceOrContents, { encoding: "utf-8" });
}

