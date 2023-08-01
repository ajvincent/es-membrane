import fs from "fs/promises";
import path from "path";

import {
  ClassDeclaration,
  CodeBlockWriter,
  MethodDeclaration,
  StructureKind,
  SyntaxKind,
  Type,
} from "ts-morph";

import {
  ModuleSourceDirectory,
  pathToModule,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import getTS_SourceFile from "#stage_utilities/source/getTS_SourceFile.mjs";

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
};

const projectRoot: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../../.."
};

export default async function(): Promise<void> {
  const fileWriter: CodeBlockWriter = new CodeBlockWriter({
    indentNumberOfSpaces: 2
  });

  const tsMorphSource = getTS_SourceFile(projectRoot, "node_modules/ts-morph/lib/ts-morph.d.ts");
  type SyntaxKindProperty = `SyntaxKind.${string}`;

  const classToSyntaxKindMap = new Map<ClassDeclaration, SyntaxKind>;
  const classToSyntaxKind_NameMap = new Map<ClassDeclaration, SyntaxKindProperty>;

  {
    const classProperties = tsMorphSource.getInterfaceOrThrow("ImplementedKindToNodeMappings").getProperties();
    classProperties.forEach(_classProp => {
      const computedName = _classProp.getNameNode().asKindOrThrow(SyntaxKind.ComputedPropertyName);

      const expression = computedName.getExpression().asKindOrThrow(SyntaxKind.PropertyAccessExpression);
      const expressionFullName = expression.getFullText() as SyntaxKindProperty;
      const kindName = expression.getNameNode().getText() as keyof typeof SyntaxKind;
      const kind = SyntaxKind[kindName];

      // still need to get the class declaration
      const _reference = _classProp.getTypeNodeOrThrow().asKindOrThrow(SyntaxKind.TypeReference);
      const _className = _reference.getTypeName().getText();
      const _class = tsMorphSource.getClassOrThrow(_className);

      classToSyntaxKindMap.set(_class, kind);
      classToSyntaxKind_NameMap.set(_class, expressionFullName);
    });
  }

  const classesToStructureMethods = new Map<ClassDeclaration, MethodDeclaration>;
  for (const _class of tsMorphSource.getClasses()) {
    const _getStructure = _class.getMethod("getStructure");
    if (_getStructure)
      classesToStructureMethods.set(_class, _getStructure);
  }

  const syntaxKindToStructureKinds = new Map<SyntaxKind, Set<StructureKind>>;

  fileWriter.writeLine("// This file is generated.  Do not edit.  See ../../build/structureToSyntax.mts instead.");

  fileWriter.writeLine(`import { StructureKind, SyntaxKind } from "ts-morph";`);
  fileWriter.writeLine("const StructureKindToSyntaxKindMap: ReadonlyMap<StructureKind, SyntaxKind> = new Map<StructureKind, SyntaxKind>([");

  for (const [_class, _method] of classesToStructureMethods.entries()) {
    const className = classToSyntaxKind_NameMap.get(_class);

    const firstType = _method.getReturnType();
    const returnTypes: Type[] = firstType.isUnion() ? firstType.getUnionTypes() : [firstType];

    const structureKindSet = new Set<StructureKind>;
    const syntaxKind = classToSyntaxKindMap.get(_class)!;

    syntaxKindToStructureKinds.set(syntaxKind, structureKindSet);

    try {
      returnTypes.forEach(baseType => {
        const specificType = baseType.getPropertyOrThrow("kind").getTypeAtLocation(_method);
        const structureKind: StructureKind = specificType.getLiteralValueOrThrow() as StructureKind;
        const structureKindName = StructureKind[structureKind];

        if (className)
          fileWriter.writeLine(`  [StructureKind.${structureKindName}, ${className}],`);
        else
          fileWriter.writeLine(`  // no SyntaxKind found for StructureKind.${structureKindName}`);
      });
    }
    catch (ex) {
      // do nothing
    }
  }
  fileWriter.writeLine("]);");
  fileWriter.writeLine("export default StructureKindToSyntaxKindMap;");

  const pathToMapFile = pathToModule(stageDir, "source/generated/structureToSyntax.mts");
  await fs.mkdir(path.dirname(pathToMapFile), { recursive: true });
  await fs.writeFile(pathToMapFile, fileWriter.toString(), { encoding: "utf-8" });
}
