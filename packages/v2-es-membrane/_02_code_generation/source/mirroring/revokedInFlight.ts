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
  MemberedStatementsKey,
  LiteralTypeStructureImpl,
  SourceFileImpl,
  TypeMembersMap,
  type stringWriterOrStatementImpl,
} from "ts-morph-structures";

import {
  createSourceFileFromStructure,
} from "#stage_utilities/source/getTS_SourceFile.js";

import {
  generatedDirs,
} from "../constants.js";

import buildHandlerClass from "../buildHandlerClass.js";

import {
  pathToTailHandlerModule,
} from "../ObjectGraphTailHandler.js";

import buildTailDecoratorFunction, {
  tailSatisfiesStatement
} from "../utilities/tailDecoratorFunction.js";

import getRequiredProxyHandlerInterface from "../getInterfaces/requiredProxy.js";

//#endregion preamble

const RequiredProxyHandlerMembers = TypeMembersMap.fromMemberedObject(getRequiredProxyHandlerInterface());

/** `try { runTrap() } catch (ex) {} */
export default
async function createRevokedInFlight(
  handlerInterface: InterfaceDeclarationImpl
): Promise<void>
{
  const pathToRevokedInFlight = path.join(generatedDirs.raw, "decorators/revokedInFlight.ts");
  const importManager = buildImportManager(pathToRevokedInFlight);

  const decoratorFunction = buildTailDecoratorFunction();
  decoratorFunction.name = "RevokedInFlight";

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
    pathToRevokedInFlight,
    sourceStructure
  );
}

function buildImportManager(
  pathToReturnValuesModule: string
): ImportManager
{
  const importManager = new ImportManager(pathToReturnValuesModule);

  importManager.addImports({
    pathToImportedModule: path.join(generatedDirs.raw, "../types/ClassDecoratorFunction.ts"),
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

  importManager.addImports({
    pathToImportedModule: path.join(generatedDirs.raw, "../AlwaysRevokedProxy.ts"),
    isPackageImport: false,
    isDefaultImport: true,
    isTypeOnly: false,
    importNames: [
      "AlwaysRevokedProxy",
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

  const originalTrap = RequiredProxyHandlerMembers.getAsKind(StructureKind.MethodSignature, trap.name)!;
  const argsAfterFirst = originalTrap.parameters.map(param => param.name).slice(1).join(", ");
  return [
    (writer: CodeBlockWriter): void => {
      writer.write("try ");
      writer.block(() => {
        writer.write(`return super.${trap.name}(shadowTarget, ${
          trap.parameters.map(param => param.name).slice(1).join(", ")
        });`);
      });
      writer.write("finally ");
      writer.block(() => {
        writer.write(`
          if (this.thisGraphValues!.isRevoked) return Reflect.${trap.name}(AlwaysRevokedProxy, ${argsAfterFirst});`
        );
      });
    }
  ];
}
