import path from "node:path";

import {
  ESLint
} from "eslint";

export default async function runESLint(
  cwd: string,
  files: string[]
): Promise<void>
{
  const eslintRunner = new ESLint({
    cwd,
    overrideConfigFile: path.join(cwd, "eslint.config.mjs"),
  });

  const results = await eslintRunner.lintFiles(files);

  // 4. Format the results.
  const formatter = await eslintRunner.loadFormatter();
  const resultText = await formatter.format(results);

  // 5. Output it.
  console.log(resultText);

  const errorCount = results.reduce((previousValue, result): number => {
    return previousValue + result.errorCount + result.warningCount;
  }, 0);
  if (errorCount > 0) {
    process.exit(1);
  }
}
