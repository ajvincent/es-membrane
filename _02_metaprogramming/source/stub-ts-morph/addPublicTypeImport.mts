import {
  type ModuleSourceDirectory,
  pathToModule
} from "../../../_01_stage_utilities/source/AsyncSpecModules.mjs";

import BaseStub from "./base.mjs";

const publicTypesSource: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../../aspects/public-types"
};

export default function addPublicTypeImport(
  stubGenerator: BaseStub,
  typeFile: string,
  typeToImport: string
) : void
{
  stubGenerator.addImport(
    pathToModule(publicTypesSource, typeFile),
    `type ${typeToImport}`,
    false
  );
}
