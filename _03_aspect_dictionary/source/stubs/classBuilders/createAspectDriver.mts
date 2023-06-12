import path from "path";
import { SourceFile } from "ts-morph";

import AspectDriverStub from "../mixins/AspectDriverStub.mjs";

export type CreateAspectDriverConfig = {
  sourceFile: SourceFile,
  interfaceOrAliasName: string,
  destinationDir: string,
  pathToBaseClassFile: string,
  className: string,
  isDefaultImport: boolean,
  moduleName?: string,
};

export default
async function createAspectDriver(
  configuration: CreateAspectDriverConfig
) : Promise<void>
{
  const {
    sourceFile,
    interfaceOrAliasName,
    destinationDir,
    pathToBaseClassFile,
    className,
    isDefaultImport,
    moduleName = "AspectDriver.mts",
  } = configuration;

  const generator = new AspectDriverStub;
  generator.configureStub(
    sourceFile,
    interfaceOrAliasName,
    path.resolve(destinationDir, moduleName),
    className + "_AspectDriver"
  );

  generator.defineDefaultBaseClass(
    pathToBaseClassFile,
    className,
    isDefaultImport
  );

  generator.addImport(
    sourceFile.getFilePath().replace(/(?:\.d)?\.(m?)ts/, ".$1js"),
    "type " + interfaceOrAliasName,
    false
  );

  generator.buildClass();

  await generator.write();
}
