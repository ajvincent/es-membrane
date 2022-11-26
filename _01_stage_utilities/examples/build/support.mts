import fs from "fs/promises";
import path from "path";
import url from "url";

async function createBuildDate() : Promise<void> {
  const generatedDir = path.resolve(url.fileURLToPath(import.meta.url), "../../generated");

  try {
    await fs.access(generatedDir);
  }
  catch (ex) {
    await fs.mkdir(generatedDir);
  }

  const targetFile = path.join(generatedDir, "buildDate.mts");
  await fs.writeFile(targetFile, `
const buildDate = "${(new Date()).toISOString()}";
export default buildDate;
  `.trim() + "\n");
}

export default createBuildDate;
