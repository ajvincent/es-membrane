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

import TS_MORPH_D from "#utilities/source/ts-morph-d-file.js";
import { pathToModule } from "#utilities/source/AsyncSpecModules.js";

import {
  stageDir
} from "../pre-build/constants.js";

export default
async function structureToSyntax(): Promise<void>
{
  const fileWriter: CodeBlockWriter = new CodeBlockWriter({
    indentNumberOfSpaces: 2
  });

  type SyntaxKindProperty = `SyntaxKind.${string}`;

  const classToSyntaxKindMap = new Map<ClassDeclaration, SyntaxKind>;
  const classToSyntaxKind_NameMap = new Map<ClassDeclaration, SyntaxKindProperty>;

  {
    const classProperties = TS_MORPH_D.getInterfaceOrThrow("ImplementedKindToNodeMappings").getProperties();
    classProperties.forEach(_classProp => {
      const computedName = _classProp.getNameNode().asKindOrThrow(SyntaxKind.ComputedPropertyName);

      const expression = computedName.getExpression().asKindOrThrow(SyntaxKind.PropertyAccessExpression);
      const expressionFullName = expression.getFullText() as SyntaxKindProperty;
      const kindName = expression.getNameNode().getText() as keyof typeof SyntaxKind;
      const kind = SyntaxKind[kindName];

      // still need to get the class declaration
      const _reference = _classProp.getTypeNodeOrThrow().asKindOrThrow(SyntaxKind.TypeReference);
      const _className = _reference.getTypeName().getText();
      const _class = TS_MORPH_D.getClassOrThrow(_className);

      classToSyntaxKindMap.set(_class, kind);
      classToSyntaxKind_NameMap.set(_class, expressionFullName);
    });
  }

  const classesToStructureMethods = new Map<ClassDeclaration, MethodDeclaration>;
  for (const _class of TS_MORPH_D.getClasses()) {
    const _getStructure = _class.getMethod("getStructure");
    if (_getStructure)
      classesToStructureMethods.set(_class, _getStructure);
  }

  fileWriter.writeLine("// This file is generated.  Do not edit.  See ../../build/structureToSyntax.ts instead.");

  fileWriter.writeLine(`import { StructureKind, SyntaxKind } from "ts-morph";`);
  fileWriter.writeLine(
    "const StructureKindToSyntaxKindMap: ReadonlyMap<StructureKind, SyntaxKind> = new Map<StructureKind, SyntaxKind>(["
  );

  for (const [_class, _method] of classesToStructureMethods.entries()) {
    const className = classToSyntaxKind_NameMap.get(_class);

    const firstType = _method.getReturnType();
    const returnTypes: Type[] = firstType.isUnion() ? firstType.getUnionTypes() : [firstType];

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
    catch {
      // do nothing
    }
  }
  fileWriter.writeLine("]);");
  fileWriter.writeLine("export default StructureKindToSyntaxKindMap;");

  const pathToMapFile = pathToModule(stageDir, "snapshot/source/bootstrap/structureToSyntax.ts");
  await fs.mkdir(path.dirname(pathToMapFile), { recursive: true });
  await fs.writeFile(pathToMapFile, fileWriter.toString(), { encoding: "utf-8" });
}
