//#region preamble
import assert from "node:assert/strict";
import path from "path";

import {
  CodeBlockWriter,
  StructureKind,
} from "ts-morph";

import {
  ClassDeclarationImpl,
  ImportManager,
  InterfaceDeclarationImpl,
  LiteralTypeStructureImpl,
  SourceFileImpl,
  MemberedStatementsKey,
  type stringWriterOrStatementImpl,
} from "ts-morph-structures";

import {
  createSourceFileFromStructure,
} from "#stage_utilities/source/getTS_SourceFile.js";

import {
  stageDir
} from "../constants.js";

import buildHandlerClass from "../buildHandlerClass.js";

import {
  pathToTailHandlerModule,
} from "../ObjectGraphTailHandler.js";

import buildConstStatement from "../utilities/buildConstStatement.js";

import buildTailDecoratorFunction, {
  tailSatisfiesStatement
} from "../utilities/tailDecoratorFunction.js";

//#endregion preamble

export default
async function createWrapReturnValues(
  handlerInterface: InterfaceDeclarationImpl
): Promise<void>
{
  const pathToReturnValuesModule = path.join(stageDir, "generated/decorators/wrapReturnValues.ts");
  const importManager = buildImportManager(pathToReturnValuesModule);

  const decoratorFunction = buildTailDecoratorFunction();
  decoratorFunction.name = "WrapReturnValues";

  const classDecl: ClassDeclarationImpl = buildHandlerClass(
    handlerInterface, buildProxyHandlerTrap
  );
  classDecl.name = decoratorFunction.name;
  classDecl.extendsStructure = LiteralTypeStructureImpl.get("baseClass");

  decoratorFunction.statements.push(
    classDecl,
    `return ${classDecl.name!};`
  );

  const sourceStructure = new SourceFileImpl();
  sourceStructure.statements.push(
    ...importManager.getDeclarations(),
    decoratorFunction,
    tailSatisfiesStatement(classDecl),
  );

  await createSourceFileFromStructure(
    pathToReturnValuesModule,
    sourceStructure
  );
}

function buildImportManager(
  pathToReturnValuesModule: string
): ImportManager
{
  const importManager = new ImportManager(pathToReturnValuesModule);

  importManager.addImports({
    pathToImportedModule: path.join(stageDir, "types/ClassDecoratorFunction.ts"),
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [
      "ClassDecoratorFunction"
    ]
  });

  importManager.addImports({
    pathToImportedModule: pathToTailHandlerModule,
    isPackageImport: false,
    isDefaultImport: true,
    isTypeOnly: false,
    importNames: [
      "ObjectGraphTailHandler"
    ]
  });

  return importManager;
}

function buildProxyHandlerTrap(
  key: MemberedStatementsKey
): readonly stringWriterOrStatementImpl[]
{
  assert.equal(key.groupType?.kind, StructureKind.MethodSignature, "expected a method");
  const trap = key.groupType;

  return [
    buildConstStatement(
      "result",
      key.groupType.returnTypeStructure!,
      `super.${key.groupType.name}(${key.groupType.parameters.map(param => param.name).join(", ")})`
    ),

    (writer: CodeBlockWriter): void => {
      writer.write(`return this.thisGraphValues!.`);
      if (trap.name === "getOwnPropertyDescriptor") {
        writer.write(`getDescriptorInGraph(result, this.thisGraphKey);`)
        return;
      }

      if (trap.name === "ownKeys") {
        writer.write(`getArrayInGraph(result, this.thisGraphKey)`)
      }
      else {
        writer.write(`getValueInGraph(result, this.thisGraphKey)`)
      }
      writer.write(` as `);
      trap.returnTypeStructure!.writerFunction(writer);
      writer.write(";");
    }
  ];
}
