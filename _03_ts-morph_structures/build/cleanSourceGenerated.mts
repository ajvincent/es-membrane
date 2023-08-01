// #region preamble
import fs from "fs/promises";

import {
  sourceGeneratedDir,
} from "./constants.mjs";

// #endregion preamble

export default async function cleanGenerated(): Promise<void>
{
  let found = false;

  try {
    await fs.access(sourceGeneratedDir);
    found = true;
  }
  catch {
    // do nothing
  }
  if (found)
    await fs.rm(sourceGeneratedDir, { recursive: true });
}
