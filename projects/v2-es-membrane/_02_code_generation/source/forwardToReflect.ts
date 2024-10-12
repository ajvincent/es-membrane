import assert from "node:assert/strict";
import path from "path";

import {
  StructureKind,
} from "ts-morph";

import {
  type ClassDeclarationImpl,
  type InterfaceDeclarationImpl,
  LiteralTypeStructureImpl,
  SourceFileImpl,
  type MemberedStatementsKey,
  TypeArgumentedTypeStructureImpl,
  type stringWriterOrStatementImpl,
} from "ts-morph-structures";

import {
  createSourceFileFromStructure,
} from "#stage_utilities/source/getTS_SourceFile.js";

import {
  generatedDirs
} from "./constants.js";

import getRequiredProxyHandlerInterface from "./getInterfaces/requiredProxy.js";
import buildHandlerClass from "./buildHandlerClass.js";

export default
async function forwardToReflect(): Promise<void>
{
  const pathToForwardModule = path.join(generatedDirs.raw, "ForwardToReflect.ts");

  const proxyInterface: InterfaceDeclarationImpl = getRequiredProxyHandlerInterface();

  const classDecl: ClassDeclarationImpl = buildHandlerClass(
    proxyInterface,
    function(
      key: MemberedStatementsKey
    ): readonly stringWriterOrStatementImpl[] {
      assert.equal(key.groupType?.kind, StructureKind.MethodSignature, "expected a method");
      const methodArguments: string[] = [];
      for (const param of key.groupType.parameters) {
        let arg: string = param.name;
        if (arg === "target") {
          if (key.statementGroupKey === "apply") {
            arg += " as CallableFunction";
          } else if (key.statementGroupKey === "construct") {
            arg += " as NewableFunction";
          }
        }
        methodArguments.push(arg);
      }

      return [
        `return Reflect.${key.statementGroupKey}(${methodArguments.join(", ")});`
      ];
    }
  );

  classDecl.name = "ForwardToReflect";
  classDecl.isDefaultExport = true;

  classDecl.implementsSet.add(new TypeArgumentedTypeStructureImpl(
    LiteralTypeStructureImpl.get("Required"),
    [
      new TypeArgumentedTypeStructureImpl(
        LiteralTypeStructureImpl.get(proxyInterface.name),
        [
          LiteralTypeStructureImpl.get("object")
        ]
      )
    ]
  ));

  const sourceStructure = new SourceFileImpl();
  sourceStructure.statements.push(
    "// This file is generated.  Do not edit.",
    classDecl,
  );

  await createSourceFileFromStructure(
    pathToForwardModule,
    sourceStructure
  );
}
