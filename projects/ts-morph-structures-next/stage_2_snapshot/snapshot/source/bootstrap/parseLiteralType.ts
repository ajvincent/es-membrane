import {
  ModuleKind,
  ModuleResolutionKind,
  Project,
  type ProjectOptions,
  ScriptTarget,
  SourceFile,
} from "ts-morph";

import {
  getTypeAugmentedStructure,
  TypeAliasDeclarationImpl,
  TypeStructures,
  VoidTypeNodeToTypeStructureConsole,
} from "../exports.js";

let ParseLiteralProject: Project;

export default function parseLiteralType(source: string): TypeStructures {
  let name = "SOMERANDOMSTRING_";
  for (let i = 0; i < 10; i++) {
    name += String.fromCharCode(Math.floor(Math.random() * 26) + 65);
  }
  ParseLiteralProject ??= defineProject();

  const tempFile: SourceFile =
    ParseLiteralProject.createSourceFile("tempFile.ts");

  try {
    const aliasStructure = getTypeAugmentedStructure(
      tempFile.addTypeAlias(new TypeAliasDeclarationImpl(name, source)),
      VoidTypeNodeToTypeStructureConsole,
      true,
    ).rootStructure as TypeAliasDeclarationImpl;

    return aliasStructure.typeStructure!;
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
