import {
  type ModuleSourceDirectory,
  pathToModule
} from "../../../../../_01_stage_utilities/source/AsyncSpecModules.mjs";

import BaseStub from "../baseStub.mjs";

const aspectTypesSource: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../../../../aspects/types"
};

export default function addPublicTypeImport(
  stubGenerator: BaseStub,
  typeFile: string,
  typeToImport: string
) : void
{
  stubGenerator.addImport(
    pathToModule(aspectTypesSource, typeFile),
    `type ${typeToImport}`,
    false
  );
}
