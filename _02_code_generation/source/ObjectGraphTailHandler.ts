/**
 * @remarks
 * `ObjectGraphTailHandler` converts from `ObjectGraphHandler<T>` to `Required<ProxyHandler<T>>` by invoking the
 * `nextHandler` argument with the `nextTarget` and `nextArgArray`, `nextThisArg`, `nextDescriptor`,
 * etc. arguments.
 */

import assert from "node:assert/strict";
import path from "path";

import {
  Scope,
  StructureKind,
} from "ts-morph";

import {
  ClassDeclarationImpl,
  ClassMembersMap,
  type ClassStatementsGetter,
  ClassSupportsStatementsFlags,
  type ClassTailStatementsGetter,
  InterfaceDeclarationImpl,
  LiteralTypeStructureImpl,
  SourceFileImpl,
  MemberedTypeToClass,
  MemberedStatementsKey,
  TypeArgumentedTypeStructureImpl,
  TypeMembersMap,
  stringWriterOrStatementImpl,
  ImportManager,
} from "ts-morph-structures";

import {
  createSourceFileFromStructure,
} from "#stage_utilities/source/getTS_SourceFile.mjs";

import {
  stageDir
} from "./constants.js";

import buildHandlerClass from "./buildHandlerClass.js";

import {
  pathToInterfaceModule
} from "./ObjectGraphHandlerIfc.js";

export default
async function createObjectGraphTailHandler(
  handlerInterface: InterfaceDeclarationImpl
): Promise<void>
{
  const pathToTailHandlerModule = path.join(stageDir, "generated/ObjectGraphTailHandler.ts");

  const importManager = new ImportManager(pathToTailHandlerModule);
  importManager.addImports({
    pathToImportedModule: pathToInterfaceModule,
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [
      "ObjectGraphHandlerIfc"
    ],
  });

  importManager.addImports({
    pathToImportedModule: path.join(stageDir, "types/RequiredProxyHandler.d.ts"),
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [
      "RequiredProxyHandler"
    ]
  });

  const classDecl: ClassDeclarationImpl = buildHandlerClass(
    handlerInterface,
    function(
      key: MemberedStatementsKey
    ): readonly stringWriterOrStatementImpl[] {
      assert.equal(key.groupType?.kind, StructureKind.MethodSignature, "expected a method");

      let statements: stringWriterOrStatementImpl[] = [];
      let foundNextHandler = false;

      const acceptedParameterNames: string[] = [];
      const voidParameterNames: string[] = [];
      for (const param of key.groupType.parameters) {
        if (param.name === "nextHandler") {
          foundNextHandler = true;
          continue;
        }

        if (foundNextHandler) {
          acceptedParameterNames.push(param.name);
        } else {
          voidParameterNames.push(param.name);
        }
      }

      return [
        ...voidParameterNames.map(paramName => `void(${paramName});`),
        `return nextHandler.${key.groupType.name}(${acceptedParameterNames.join(", ")});`
      ];

      return statements;
    }
  );

  classDecl.name = "ObjectGraphTailHandler";
  classDecl.isDefaultExport = true;

  classDecl.implementsSet.add(LiteralTypeStructureImpl.get("ObjectGraphHandlerIfc"));

  const sourceStructure = new SourceFileImpl();
  sourceStructure.statements.push(
    "// This file is generated.  Do not edit.",
    ...importManager.getDeclarations(),
    classDecl,
  );

  await createSourceFileFromStructure(
    pathToTailHandlerModule,
    sourceStructure
  );
}
