import path from "path";

import {
  sourceFile,
  destinationDir,
  pathToTypeFile,
} from "./constants.mjs";

import AspectDriverStub from "../source/AspectDriverStub.mjs";

export default
async function buildAspectStub() : Promise<void> {
  const generator = new AspectDriverStub;
  generator.configureStub(
    sourceFile,
    "NumberStringType",
    path.resolve(destinationDir, "AspectDriver.mts"),
    "NumberStringClass_AspectDriver"
  );

  generator.addImport(
    pathToTypeFile,
    "type NumberStringType",
    false
  );

  generator.buildClass();

  await generator.write();
}
