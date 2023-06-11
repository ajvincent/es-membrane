import path from "path";
import { SourceFile } from "ts-morph";

import AspectDriverStub from "../mixins/AspectDriverStub.mjs";

export default
async function createAspectDriver(
  sourceFile: SourceFile,
  interfaceOrAliasName: string,
  destinationDir: string,
  pathToBaseClassFile: string,
  className: string,
  isDefaultImport: boolean,
) : Promise<void>
{
  const generator = new AspectDriverStub;
  generator.configureStub(
    sourceFile,
    interfaceOrAliasName,
    path.resolve(destinationDir, "AspectDriver.mts"),
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
