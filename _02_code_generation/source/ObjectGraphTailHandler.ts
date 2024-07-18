/**
 * @remarks
 * `ObjectGraphTailHandler` converts from `ObjectGraphHandler<T>` to `Required<ProxyHandler<T>>` by invoking
 * `Reflect` with the `nextTarget` and `nextArgArray`, `nextThisArg`, `nextDescriptor`,
 * etc. arguments.
 */

//#region preamble
import assert from "node:assert/strict";
import path from "path";

import {
  Scope,
  StructureKind,
} from "ts-morph";

import {
  ClassDeclarationImpl,
  type ClassStatementsGetter,
  ClassSupportsStatementsFlags,
  type ConstructorBodyStatementsGetter,
  ImportManager,
  InterfaceDeclarationImpl,
  LiteralTypeStructureImpl,
  SourceFileImpl,
  MemberedStatementsKey,
  type MemberedTypeToClass,
  ParameterDeclarationImpl,
  PropertySignatureImpl,
  type stringWriterOrStatementImpl,
} from "ts-morph-structures";

import {
  createSourceFileFromStructure,
} from "#stage_utilities/source/getTS_SourceFile.mjs";

import {
  stageDir
} from "./constants.js";

import buildHandlerClass, {
  ClassBuilder_Priorities
} from "./buildHandlerClass.js";

import {
  pathToInterfaceModule
} from "./ObjectGraphHandlerIfc.js";

import UnionStringOrSymbol from "./UnionStringOrSymbol.js";
//#endregion preamble

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
    pathToImportedModule: path.join(stageDir, "types/MembraneIfc.d.ts"),
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [
      "MembraneIfc"
    ]
  });

  const classDecl: ClassDeclarationImpl = buildHandlerClass(
    handlerInterface, buildProxyHandlerTrap, applyInitialization
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

function buildProxyHandlerTrap(
  key: MemberedStatementsKey
): readonly stringWriterOrStatementImpl[]
{
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

function applyInitialization(
  classBuilder: MemberedTypeToClass
): void
{
  const membrane = new PropertySignatureImpl("membrane");
  {
    membrane.typeStructure = LiteralTypeStructureImpl.get("MembraneIfc");
    membrane.isReadonly = true;
    classBuilder.addTypeMember(false, membrane);

    const ctorParam = new ParameterDeclarationImpl("membrane");
    ctorParam.typeStructure = membrane.typeStructure;
    classBuilder.constructorParameters.push(ctorParam);
  }

  const thisGraphKey = new PropertySignatureImpl("thisGraphKey");
  {
    thisGraphKey.typeStructure = UnionStringOrSymbol;
    thisGraphKey.isReadonly = true;
    classBuilder.addTypeMember(false, thisGraphKey);

    const ctorParam = new ParameterDeclarationImpl("thisGraphKey");
    ctorParam.typeStructure = thisGraphKey.typeStructure;
    classBuilder.constructorParameters.push(ctorParam);
  }

  const originalScopeCallback = classBuilder.scopeCallback!.getScope;
  classBuilder.scopeCallback!.getScope = function(
    isStatic,
    kind,
    memberName
  ): Scope | undefined
  {
    if (kind === StructureKind.Method)
      return originalScopeCallback.call(this, isStatic, kind, memberName);

    if (memberName === "membrane")
      return Scope.Protected;
    if (memberName === "thisGraphKey")
      return Scope.Protected;
  }

  const ctorStatements: ClassStatementsGetter & ConstructorBodyStatementsGetter = {
    keyword: "constructor statements",
    supportsStatementsFlags: ClassSupportsStatementsFlags.ConstructorBodyStatements,

    filterCtorBodyStatements(
      key: MemberedStatementsKey
    ): boolean
    {
      return key.isFieldStatic === false && key.fieldType?.kind === StructureKind.PropertySignature;
    },

    getCtorBodyStatements(
      key: MemberedStatementsKey
    ): readonly string[]
    {
      return [
        `this.${key.fieldKey} = ${key.fieldKey};`,
      ];
    },
  }

  classBuilder.addStatementGetters(
    ClassBuilder_Priorities.Initialization, [ctorStatements]
  );
}
