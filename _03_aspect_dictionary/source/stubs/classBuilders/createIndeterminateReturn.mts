import path from "path";
import { SourceFile } from "ts-morph";

import IndeterminateReturnStub from "../mixins/IndeterminateReturnStub.mjs";

type CreateIndeterminateReturnConfig = {
  sourceFile: SourceFile,
  interfaceOrAliasName: string,
  destinationDir: string,
  className: string,
  moduleName?: string,
}

export default
async function createInderminateReturn(
  configuration: CreateIndeterminateReturnConfig
) : Promise<void>
{
  const {
    sourceFile,
    interfaceOrAliasName,
    destinationDir,
    className,
    moduleName = "IndeterminateReturn.mts",
  } = configuration;

  const generator = new IndeterminateReturnStub;
  generator.configureStub(
    sourceFile,
    interfaceOrAliasName,
    path.resolve(destinationDir, moduleName),
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
