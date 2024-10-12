// #region preamble
import fs from "fs/promises";
import path from "path";

import {
  generatedDir,
} from "./constants.mjs";

// #endregion preamble

export default async function cleanStubs(): Promise<void>
{
  let found = false;
  const destinationDir = path.join(generatedDir, "stubs");

  try {
    await fs.access(destinationDir);
    found = true;
  }
  catch {
    // do nothing
  }
  if (found)
    await fs.rm(destinationDir, { recursive: true });
}
