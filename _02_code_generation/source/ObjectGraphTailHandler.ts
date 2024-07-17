/**
 * @remarks
 * `ObjectGraphTailHandler` converts from `ObjectGraphHandler<T>` to `Required<ProxyHandler<T>>` by invoking
 * `Reflect` with the `nextTarget` and `nextArgArray`, `nextThisArg`, `nextDescriptor`,
 * etc. arguments.
 */

import assert from "node:assert/strict";
import path from "path";

import {
  StructureKind,
} from "ts-morph";

import {
  ClassDeclarationImpl,
  InterfaceDeclarationImpl,
  LiteralTypeStructureImpl,
  SourceFileImpl,
  MemberedStatementsKey,
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

  const classDecl: ClassDeclarationImpl = buildHandlerClass(
    handlerInterface,
    function(
      key: MemberedStatementsKey
    ): readonly stringWriterOrStatementImpl[] {
      assert.equal(key.groupType?.kind, StructureKind.MethodSignature, "expected a method");

      let statements: stringWriterOrStatementImpl[] = [];
      let foundNextTarget = false;

      const acceptedParameterNames: string[] = [];
      const voidParameterNames: string[] = [];
      for (const param of key.groupType.parameters) {
        let arg: string = param.name;
        if (param.name === "nextTarget") {
          foundNextTarget = true;

          if (key.statementGroupKey === "apply") {
            arg += " as CallableFunction";
          } else if (key.statementGroupKey === "construct") {
            arg += " as NewableFunction";
          }
        }

        if (foundNextTarget) {
          acceptedParameterNames.push(arg);
        } else {
          voidParameterNames.push(arg);
        }
      }

      return [
        ...voidParameterNames.map(paramName => `void(${paramName});`),
        `return Reflect.${key.groupType.name}(${acceptedParameterNames.join(", ")});`
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
