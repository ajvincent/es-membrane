/* this generates a Required<ProxyHandler<object>> class which:
(1) owns a reference to MembraneIfc, and a reference to a ShadowProxyHandler
(2) calls methods of MembraneIfc to convert target, arguments and descriptors
(3) calls methods of MembraneIfc to get the next ProxyHandler, or Reflect
(4) forwards to the same trap on the graph handler
(5) takes the response and wraps it for returning

Requirements:

- #membraneIfc: MembraneIfc;
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
  VariableDeclarationKind,
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
  TypeArgumentedTypeStructureImpl,
  TypeParameterDeclarationImpl,
  type TypeStructures,
  UnionTypeStructureImpl,
  VariableDeclarationImpl,
  VariableStatementImpl,
  type stringOrWriterFunction,
  type stringWriterOrStatementImpl,
} from "ts-morph-structures";

import {
  createSourceFileFromStructure,
} from "#stage_utilities/source/getTS_SourceFile.mjs";

import {
  stageDir
} from "./constants.js";

import getRequiredProxyHandlerInterface from "./getInterfaces/requiredProxy.js";
import buildHandlerClass from "./buildHandlerClass.js";

import {
  pathToInterfaceModule
} from "./ObjectGraphHandlerIfc.js";
import UnionStringOrSymbol from "./UnionStringOrSymbol.js";
// #endregion preamble

const pathToConvertingHeadModule = path.join(stageDir, "generated/ConvertingHeadProxyHandler.ts");

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
  classDecl.isAbstract = true;
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
    pathToImportedModule: path.join(stageDir, "types/RequiredProxyHandler.d.ts"),
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [
      "RequiredProxyHandler"
    ]
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

  importManager.addImports({
    pathToImportedModule: path.join(stageDir, "types/MembraneIfc.d.ts"),
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: [
      "MembraneIfc"
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

    if (param.name === "argArray") {
      argArrayStatement = buildConstStatement(
        "nextArgArray",
        param.typeStructure!,
        (writer: CodeBlockWriter): void => {
          writer.write(`this.#membraneIfc.convertArray<`);
          param.typeStructure!.writerFunction(writer);
          writer.write(`>(graphKey, argArray)`);
        }
      );
      nextArgumentNames.push("nextArgArray");
      continue;
    }

    const nextArgumentName = `next${(param.name[0].toUpperCase() + param.name.substring(1))}`;
    nextArgumentNames.push(nextArgumentName);

    if (param.typeStructure === LiteralTypeStructureImpl.get("PropertyDescriptor")) {
      descriptorStatement = buildConstStatement(
        nextArgumentName,
        param.typeStructure,
        `this.#membraneIfc.convertDescriptor(graphKey, ${param.name})`
      );
    } else {
      sourceConvertNames.push(param.name);
      ReflectConvertNames.push(nextArgumentName);
      tupleType.childTypes.push(param.typeStructure!);
    }
  };

  if (sourceConvertNames.length) {
    statements.push((writer: CodeBlockWriter): void => {
      writer.write(
        `const [${
          ReflectConvertNames.join(", ")
        }] = this.#membraneIfc.convertArray<`
      );
      tupleType.writerFunction(writer);
      writer.write(`>(graphKey, [${sourceConvertNames.join(", ")}]);`);
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

/** `const ${variableName}: ${typeStructure} = ${initializer};` */
function buildConstStatement(
  variableName: string,
  typeStructure: TypeStructures,
  initializer: stringOrWriterFunction,
): VariableStatementImpl
{
  const statement = new VariableStatementImpl();
  statement.declarationKind = VariableDeclarationKind.Const;

  const declaration = new VariableDeclarationImpl(variableName);
  declaration.typeStructure = typeStructure;
  declaration.initializer = initializer;

  statement.declarations.push(declaration);
  return statement;
}

/** Insert API's for the proxy traps to call. */
function insertConversionMembers(
  classDecl: ClassDeclarationImpl
): void
{
  const ctor = new ConstructorDeclarationImpl;
  classDecl.ctors.push(ctor);

  // #membraneIfc
  const MembraneIfc = new PropertyDeclarationImpl(false, "#membraneIfc");
  {
    MembraneIfc.typeStructure = LiteralTypeStructureImpl.get("MembraneIfc");

    const ctorParam = new ParameterDeclarationImpl("membraneIfc");
    ctorParam.typeStructure = MembraneIfc.typeStructure;
    ctor.parameters.push(ctorParam);

    ctor.statements.push(`this.#membraneIfc = membraneIfc;`);
  }

  // #graphHandlerIfc
  const ObjectGraphHandlerIfc = new PropertyDeclarationImpl(false, "#graphHandlerIfc");
  {
    ObjectGraphHandlerIfc.typeStructure = LiteralTypeStructureImpl.get("ObjectGraphHandlerIfc");

    const ctorParam = new ParameterDeclarationImpl("graphHandlerIfc");
    ctorParam.typeStructure = ObjectGraphHandlerIfc.typeStructure;
    ctor.parameters.push(ctorParam);

    ctor.statements.push(`this.#graphHandlerIfc = graphHandlerIfc;`);
  }

  // protected abstract getRealTargetForShadowTarget(shadowTarget: object): object;
  const getRealTargetForShadowTarget = new MethodDeclarationImpl(false, "getRealTargetForShadowTarget");
  {
    getRealTargetForShadowTarget.scope = Scope.Protected;
    getRealTargetForShadowTarget.isAbstract = true;

    const shadowTarget = new ParameterDeclarationImpl("shadowTarget");
    shadowTarget.typeStructure = LiteralTypeStructureImpl.get("object");
    getRealTargetForShadowTarget.parameters.push(shadowTarget);

    getRealTargetForShadowTarget.returnTypeStructure = shadowTarget.typeStructure;
  }

  // protected abstract getTargetGraphKeyForRealTarget(realTarget: object): string | symbol;
  const getTargetGraphKeyForRealTarget = new MethodDeclarationImpl(false, "getTargetGraphKeyForRealTarget");
  {
    getTargetGraphKeyForRealTarget.scope = Scope.Protected;
    getTargetGraphKeyForRealTarget.isAbstract = true;

    const realTarget = new ParameterDeclarationImpl("realTarget");
    realTarget.typeStructure = LiteralTypeStructureImpl.get("object");
    getTargetGraphKeyForRealTarget.parameters.push(realTarget);

    getTargetGraphKeyForRealTarget.returnTypeStructure = UnionStringOrSymbol;
  }

  /*
  // protected abstract getValueInGraph<ValueType>(value: ValueType): ValueType;
  const getValueInGraph = new MethodDeclarationImpl(false, "getValueInGraph");
  {
    getValueInGraph.scope = Scope.Protected;
    getValueInGraph.isAbstract = true;

    const ValueType = new TypeParameterDeclarationImpl("ValueType");
    getValueInGraph.typeParameters.push(ValueType);

    const valueParam = new ParameterDeclarationImpl("value");
    valueParam.typeStructure = LiteralTypeStructureImpl.get("ValueType");
    getValueInGraph.parameters.push(valueParam);

    getValueInGraph.returnTypeStructure = valueParam.typeStructure;
  }

  // protected abstract getDescriptorInGraph(desc: PropertyDescriptor): PropertyDescriptor;
  const getDescriptorInGraph = new MethodDeclarationImpl(false, "getDescriptorInGraph");
  {
    getDescriptorInGraph.scope = Scope.Protected;
    getDescriptorInGraph.isAbstract = true;

    const valueParam = new ParameterDeclarationImpl("desc");
    valueParam.typeStructure = LiteralTypeStructureImpl.get("PropertyDescriptor");
    getDescriptorInGraph.parameters.push(valueParam);

    getDescriptorInGraph.returnTypeStructure = valueParam.typeStructure;
  }
  */

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
        `this.getRealTargetForShadowTarget(target)`
      ),
      buildConstStatement(
        "graphKey",
        UnionStringOrSymbol,
        `this.getTargetGraphKeyForRealTarget(realTarget)`
      ),

      `return { realTarget, graphKey, };`,
    );
  }

  classDecl.properties.unshift(
    MembraneIfc,
    ObjectGraphHandlerIfc
  );

  classDecl.methods.unshift(
    getRealTargetForShadowTarget,
    getTargetGraphKeyForRealTarget,
    /*
    getValueInGraph,
    getDescriptorInGraph,
    */
    CommonConversionsMethod,
  );
}
