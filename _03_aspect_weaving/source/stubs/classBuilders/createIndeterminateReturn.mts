import path from "path";
import { SourceFile } from "ts-morph";

import IndeterminateReturnStub from "../mixins/IndeterminateReturnStub.mjs";

export default
async function createInderminateReturn(
  sourceFile: SourceFile,
  interfaceOrAliasName: string,
  destinationDir: string,
  className: string,
) : Promise<void>
{
  const generator = new IndeterminateReturnStub;
  generator.configureStub(
    sourceFile,
    interfaceOrAliasName,
    path.resolve(destinationDir, "IndeterminateReturn.mts"),
    className + "_IndeterminateReturn"
  );

  generator.addImport(
    sourceFile.getFilePath().replace(/(?:\.d)?\.(m?)ts/, ".$1js"),
    "type " + interfaceOrAliasName,
    false
  );

  generator.buildClass();

  await generator.write();
}
