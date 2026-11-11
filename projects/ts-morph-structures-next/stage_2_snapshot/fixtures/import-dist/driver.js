import {
  ModuleKind,
  ModuleResolutionKind,
  Project,
  ScriptTarget,
} from "ts-morph";

import {
  getAugmentedStructure,
  VoidTypeNodeToTypeStructureConsole,
} from "ts-morph-structures";

const TSC_CONFIG = {
    "compilerOptions": {
        "lib": ["es2022"],
        "module": ModuleKind.ESNext,
        "target": ScriptTarget.ESNext,
        "moduleResolution": ModuleResolutionKind.NodeNext,
    },
    skipAddingFilesFromTsConfig: true,
};
const project = new Project(TSC_CONFIG);

export default function driver(pathToFile) {
  const sourceFile = project.addSourceFileAtPath(pathToFile);
  const structure = getAugmentedStructure(
    sourceFile, VoidTypeNodeToTypeStructureConsole, true
  ).rootStructure;
  process.stdout.write(JSON.stringify(structure) + "\n\n");
}
