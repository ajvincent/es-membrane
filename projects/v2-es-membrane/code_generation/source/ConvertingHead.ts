/* this generates a Required<ProxyHandler<object>> class which:
(1) owns a reference to MembraneInternalIfc, and a reference to a ShadowProxyHandler
(2) calls methods of MembraneInternalIfc to convert target, arguments and descriptors
(3) calls methods of MembraneInternalIfc to get the next ProxyHandler, or Reflect
(4) forwards to the same trap on the graph handler
(5) takes the response and wraps it for returning

Requirements:

- #membraneIfc: MembraneInternalIfc;
- #graphHandlerIfc: ObjectGraphHandlerIfc;
- protected abstract getValueInGraph(value: object): object;
- protected abstract getDescriptorInGraph(desc: PropertyDescriptor): object;
*/

// #region preamble

import assert from "node:assert/strict";
import path from "path";

import {
  type CodeBlockWriter,
  Scope,
  StructureKind,
} from "ts-morph";

import {
  type ClassDeclarationImpl,
  ConstructorDeclarationImpl,
  ImportManager,
  type InterfaceDeclarationImpl,
  LiteralTypeStructureImpl,
  MemberedObjectTypeStructureImpl,
  type MemberedStatementsKey,
  MethodDeclarationImpl,
  ParameterDeclarationImpl,
  PropertyDeclarationImpl,
  PropertySignatureImpl,
  SourceFileImpl,
  TupleTypeStructureImpl,
  TypeAliasDeclarationImpl,
  VariableStatementImpl,
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

import {
  pathToInterfaceModule
} from "./ObjectGraphHandlerIfc.js";

import UnionStringOrSymbol from "./UnionStringOrSymbol.js";

import buildConstStatement from "./utilities/buildConstStatement.js";

// #endregion preamble

const pathToConvertingHeadModule = path.join(generatedDirs.raw, "ConvertingHeadProxyHandler.ts");

export default
async function createConvertingHeadProxyHandler(): Promise<void>
{
  const proxyInterface: InterfaceDeclarationImpl = getRequiredProxyHandlerInterface();
  const importManager = buildImportManager();
  const CommonConversions = buildCommonConversionsAlias();

  proxyInterface.methods.forEach(method => {
    method.parameters[0]!.name = "shadowTarget";
  })

  const classDecl: ClassDeclarationImpl = buildHandlerClass(
    proxyInterface,
    getStatementsForProxyHandlerTrap
  );

  classDecl.name = "ConvertingHeadProxyHandler";
  classDecl.isDefaultExport = true;

  classDecl.implementsSet.add(LiteralTypeStructureImpl.get("RequiredProxyHandler"));

  insertConversionMembers(classDecl);

  const sourceStructure = new SourceFileImpl();
  sourceStructure.statements.push(
    "// This file is generated.  Do not edit.",
    ...importManager.getDeclarations(),
    CommonConversions,
    classDecl,
  );

  await createSourceFileFromStructure(
    pathToConvertingHeadModule,
    sourceStructure
  );
}

function buildImportManager(): ImportManager
{
  const importManager = new ImportManager(pathToConvertingHeadModule);
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
    pathToImportedModule: path.join(generatedDirs.raw, "../types/ObjectGraphHeadIfc.d.ts"),
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [
      "ObjectGraphConversionIfc"
    ]
  });

  importManager.addImports({
    pathToImportedModule: path.join(generatedDirs.raw, "../types/RequiredProxyHandler.d.ts"),
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [
      "RequiredProxyHandler"
    ]
  });

  importManager.addImports({
    pathToImportedModule: path.join(generatedDirs.raw, "../types/MembraneInternalIfc.d.ts"),
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [
      "MembraneInternalIfc"
    ]
  });

  return importManager;
}

/** `type CommonConversions = { realTarget: object, graphKey: string | symbol; };` */
function buildCommonConversionsAlias(): TypeAliasDeclarationImpl
{
  const CommonMemberedType = new MemberedObjectTypeStructureImpl;
  const CommonConversions = new TypeAliasDeclarationImpl("CommonConversions", CommonMemberedType);

  const realTarget = new PropertySignatureImpl("realTarget");
  realTarget.typeStructure = LiteralTypeStructureImpl.get("object");

  const graphKey = new PropertySignatureImpl("graphKey");
  graphKey.typeStructure = UnionStringOrSymbol;

  CommonMemberedType.properties.push(realTarget, graphKey);

  return CommonConversions;
}

function getStatementsForProxyHandlerTrap(
  key: MemberedStatementsKey
): readonly stringWriterOrStatementImpl[]
{
  assert.equal(key.groupType?.kind, StructureKind.MethodSignature);

  // setting up common values
  const statements: stringWriterOrStatementImpl[] = [
    `const { realTarget, graphKey } = this.#getCommonConversions(shadowTarget);`
  ];

  const argumentNames: string[] = [];
  const nextArgumentNames: string[] = [];

  // convert the remaining parameters
  let descriptorStatement: VariableStatementImpl | undefined;
  let argArrayStatement: VariableStatementImpl | undefined;
  const sourceConvertNames: string[] = [];
  const ReflectConvertNames: string[] = [];

  const tupleType = new TupleTypeStructureImpl;

  for (const param of key.groupType.parameters) {
    argumentNames.push(param.name);

    if (param.name === "shadowTarget")
      continue;

    const nextArgumentName = `next${(param.name[0].toUpperCase() + param.name.substring(1))}`;
    nextArgumentNames.push(nextArgumentName);

    if (param.name === "argArray") {
      argArrayStatement = buildConstStatement(
        nextArgumentName,
        param.typeStructure!,
        (writer: CodeBlockWriter): void => {
          writer.write(`this.#membraneIfc.convertArray<`);
          param.typeStructure!.writerFunction(writer);
          writer.write(`>(this.#thisGraphKey, graphKey, argArray)`);
        }
      );
      continue;
    }

    if (param.name === "attributes") {
      descriptorStatement = buildConstStatement(
        nextArgumentName,
        param.typeStructure!,
        `this.#membraneIfc.convertDescriptor(this.#thisGraphKey, graphKey, ${param.name})!`
      );
      continue;
    }

    sourceConvertNames.push(param.name);
    ReflectConvertNames.push(nextArgumentName);
    tupleType.childTypes.push(param.typeStructure!);
  };

  if (sourceConvertNames.length) {
    statements.push((writer: CodeBlockWriter): void => {
      writer.write(
        `const [${
          ReflectConvertNames.join(", ")
        }] = this.#membraneIfc.convertArray<`
      );
      tupleType.writerFunction(writer);
      writer.write(`>(this.#thisGraphKey, graphKey, [${sourceConvertNames.join(", ")}]);`);
    });
  }

  if (argArrayStatement)
    statements.push(argArrayStatement);

  if (descriptorStatement)
    statements.push(descriptorStatement);

  // call the ProxyHandler trap!!
  /*
  statements.push(
    buildConstStatement(
      `result`,
      key.groupType.returnTypeStructure!,
      `this.#graphHandlerIfc.${key.statementGroupKey}(${
        [
          ...argumentNames,
          "realTarget",
          ...nextArgumentNames,
        ].join(", ")
      })`
    ),
  );

  // convert the resulting value for this object graph
  if (key.groupType.name === "getOwnPropertyDescriptor") {
    statements.push(`return result ? this.getDescriptorInGraph(result) : this.getValueInGraph(undefined);`);
  } else {
    const { returnTypeStructure } = key.groupType;
    statements.push(
      (writer: CodeBlockWriter): void => {
        writer.write(`return this.getValueInGraph<`);
        returnTypeStructure!.writerFunction(writer);
        writer.write(`>(result);`);
      }
    );
  }
  */
  statements.push(
    `return this.#graphHandlerIfc.${key.statementGroupKey}(${
      [
        ...argumentNames,
        "graphKey",
        "realTarget",
        ...nextArgumentNames,
      ].join(", ")
    });`
  )

  return statements;
}

/** Insert API's for the proxy traps to call. */
function insertConversionMembers(
  classDecl: ClassDeclarationImpl
): void
{
  const ctor = new ConstructorDeclarationImpl;
  classDecl.ctors.push(ctor);

  // #membraneIfc
  const MembraneInternalIfc = new PropertyDeclarationImpl(false, "#membraneIfc");
  {
    MembraneInternalIfc.isReadonly = true;
    MembraneInternalIfc.typeStructure = LiteralTypeStructureImpl.get("MembraneInternalIfc");

    const ctorParam = new ParameterDeclarationImpl("membraneIfc");
    ctorParam.typeStructure = MembraneInternalIfc.typeStructure;
    ctor.parameters.push(ctorParam);

    ctor.statements.push(`this.#membraneIfc = membraneIfc;`);
  }

  // #graphHandlerIfc
  const ObjectGraphHandlerIfc = new PropertyDeclarationImpl(false, "#graphHandlerIfc");
  {
    ObjectGraphHandlerIfc.isReadonly = true;
    ObjectGraphHandlerIfc.typeStructure = LiteralTypeStructureImpl.get("ObjectGraphHandlerIfc");

    const ctorParam = new ParameterDeclarationImpl("graphHandlerIfc");
    ctorParam.typeStructure = ObjectGraphHandlerIfc.typeStructure;
    ctor.parameters.push(ctorParam);

    ctor.statements.push(`this.#graphHandlerIfc = graphHandlerIfc;`);
  }

  // #graphHeadIfc
  const ObjectGraphConversionIfc = new PropertyDeclarationImpl(false, "#graphConversionIfc");
  const ThisGraphKey = new PropertyDeclarationImpl(false, "#thisGraphKey");
  {
    ObjectGraphConversionIfc.isReadonly = true;
    ObjectGraphConversionIfc.typeStructure = LiteralTypeStructureImpl.get("ObjectGraphConversionIfc");

    ThisGraphKey.isReadonly = true;
    ThisGraphKey.typeStructure = UnionStringOrSymbol;

    const ctorParam = new ParameterDeclarationImpl("graphConversionIfc");
    ctorParam.typeStructure = ObjectGraphConversionIfc.typeStructure;
    ctor.parameters.push(ctorParam);

    ctor.statements.push(`this.#graphConversionIfc = graphConversionIfc;`);
    ctor.statements.push(`this.#thisGraphKey = graphConversionIfc.objectGraphKey;`);
  }

  // #getCommonConversions(target: object): CommonConversions
  const CommonConversionsMethod = new MethodDeclarationImpl(false, "#getCommonConversions");
  {
    const target = new ParameterDeclarationImpl("target");
    target.typeStructure = LiteralTypeStructureImpl.get("object");
    CommonConversionsMethod.parameters.push(target);

    CommonConversionsMethod.returnTypeStructure = LiteralTypeStructureImpl.get("CommonConversions");

    CommonConversionsMethod.statements.push(
      buildConstStatement(
        "realTarget",
        LiteralTypeStructureImpl.get("object"),
        `this.#graphConversionIfc.getRealTargetForShadowTarget(target)`
      ),
      buildConstStatement(
        "graphKey",
        UnionStringOrSymbol,
        `this.#graphConversionIfc.getTargetGraphKeyForRealTarget(realTarget)`
      ),

      `return { realTarget, graphKey, };`,
    );
  }

  classDecl.properties.unshift(
    MembraneInternalIfc,
    ObjectGraphHandlerIfc,
    ObjectGraphConversionIfc,
    ThisGraphKey,
  );

  classDecl.methods.unshift(
    CommonConversionsMethod,
  );
}
