import fs from "fs/promises";
import path from "path";
import url from "url";

const templatePath = url.fileURLToPath(path.join(import.meta.url, "../PassThroughGenerated.mts.in"));
const template = await fs.readFile(templatePath, { encoding: "utf-8"});
void(template);

export async function GenerateTypedPassThrough(

) : Promise<void>
{
  void(false);
}
