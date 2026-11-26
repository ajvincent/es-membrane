import {
  ModuleKind,
  ModuleResolutionKind,
  Project,
  type ProjectOptions,
  ScriptTarget,
  SourceFile,
  StructureKind,
  type TypeAliasDeclaration,
} from "ts-morph";

import type { TypeStructures } from "../exports.js";

import getAugmentedStructure from "./getAugmentedStructure.js";
import { VoidNodeToStructureConsole } from "./typeNodeConsoles.js";

let ParseLiteralProject: Project;

export function parseLiteralType(type: string): TypeStructures {
  let name = "SOMERANDOMSTRING_";
  for (let i = 0; i < 10; i++) {
    name += String.fromCharCode(Math.floor(Math.random() * 26) + 65);
  }
  ParseLiteralProject ??= defineProject();

  const tempFile: SourceFile =
    ParseLiteralProject.createSourceFile("tempFile.ts");

  try {
    const typeAlias: TypeAliasDeclaration = tempFile.addTypeAlias({
      name,
      type,
    });
    const { typeStructure } = getAugmentedStructure(
      typeAlias,
      VoidNodeToStructureConsole,
      true,
      StructureKind.TypeAlias,
    ).rootStructure;

    return typeStructure;
  } finally {
    // You might wonder, "why not just empty the file and reuse it?" - this is safer.
    ParseLiteralProject.removeSourceFile(tempFile);
  }
}

function defineProject(): Project {
  const TSC_CONFIG: ProjectOptions = {
    compilerOptions: {
      lib: ["es2022"],
      module: ModuleKind.ESNext,
      target: ScriptTarget.ESNext,
      moduleResolution: ModuleResolutionKind.NodeNext,
      sourceMap: true,
      declaration: true,
    },
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
    useInMemoryFileSystem: true,
  };

  return new Project(TSC_CONFIG);
}
