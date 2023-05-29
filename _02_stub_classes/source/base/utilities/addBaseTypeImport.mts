import {
  type ModuleSourceDirectory,
  pathToModule
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import BaseStub from "../baseStub.mjs";

const baseTypesSource: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../../types"
};

export default function addBaseTypeImport(
  stubGenerator: BaseStub,
  typeFile: string,
  typeToImport: string
) : void
{
  stubGenerator.addImport(
    pathToModule(baseTypesSource, typeFile),
    `type ${typeToImport}`,
    false
  );
}
