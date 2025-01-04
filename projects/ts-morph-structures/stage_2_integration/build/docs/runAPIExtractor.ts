import path from "path";
import fs from "fs/promises";
import url from "url";

import {
  Extractor,
  ExtractorConfig,
  ExtractorResult
} from '@microsoft/api-extractor';

import {
  projectDir
} from "#utilities/source/AsyncSpecModules.js";

import {
  typingsSnapshotDir,
} from "../../pre-build/constants.js";

export default
async function runAPIExtractor(): Promise<void>
{
  await fs.copyFile(
    path.join(projectDir, "tsconfig.json"),
    path.join(typingsSnapshotDir, "tsconfig.json")
  );

  const apiExtractorJSONPath: string = path.join(
    url.fileURLToPath(import.meta.url), "../api-extractor.jsonc"
  );

  const extractorConfig: ExtractorConfig = ExtractorConfig.loadFileAndPrepare(apiExtractorJSONPath);

  const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
    // Equivalent to the "--local" command-line parameter
    localBuild: true,
  
    // Equivalent to the "--verbose" command-line parameter
    showVerboseMessages: true
  });

  if (extractorResult.succeeded === false) {
    throw new Error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
      ` and ${extractorResult.warningCount} warnings`
    )
  }

  await Promise.resolve();
}
