//#region preamble
import {
  Scope,
  StructureKind
} from "ts-morph";

import {
  ClassFieldStatementsMap,
  type ClassMemberImpl,
  LiteralTypeStructureImpl,
  MemberedTypeToClass,
  MethodSignatureImpl,
  ParameterDeclarationImpl,
  PropertySignatureImpl,
  type TypeMembersMap,
  TypeStructureKind,
  ClassMembersMap,
  ClassSupportsStatementsFlags,
} from "#stage_two/snapshot/source/exports.js";

import {
  PromiseAllParallel,
} from "#utilities/source/PromiseTypes.js";

import {
  getClassInterfaceName,
  getStructureNameFromModified,
} from "#utilities/source/StructureNameTransforms.js";

import modifyTypeMembersForTypeStructures from "../classTools/modifyTypeMembersForTypeStructures.js";

import {
  COPY_FIELDS_NAME
} from "../constants.js";

import {
  addImportsToModule,
  InterfaceModule,
  StructureModule,
  publicExports,
} from "../../moduleClasses/exports.js";

import initializeTypes from "../../vanilla/initializer.js";

import PropertyHashesWithTypes from "../classTools/PropertyHashesWithTypes.js";

import addReadonlyArrayHandlers from "./addReadonlyArrayHandler.js";

import ArrayReadonlyHandler from "../fieldStatements/TypeStructures/ArrayReadonlyHandler.js";
import KindPropertyInitializer from "./KindProperty.js";
import CloneStructureStatements from "./CloneStructureStatements.js";
import ConstructorStatements from "./ConstructorStatements.js";
import FixKeyType_Filter from "./specialCases/fixKeyType.js";
import IsStatic_Constructor from "./specialCases/isStatic_Fields.js";
import ProxyArrayStatements from "../fieldStatements/TypeStructures/ProxyArray.js";
import ShadowArrayStatements from "../fieldStatements/TypeStructures/ShadowArray.js";
import TypeStructureSetStatements from "../fieldStatements/TypeStructures/TypeStructureSet.js";
import TypeArrayStatements from "../fieldStatements/TypeStructures/ArrayGetter.js";

import DebuggingFilter from "../fieldStatements/Debugging.js";

import {
  FromSignatureStatements,
  getFromSignatureMethod,
} from "./specialCases/fromSignature.js";

import postProcessClassMembers from "./specialCases/postProcessClassMembers.js";

import {
  AccessorExtraParameters,
  getInsertedAccessorProperty,
} from "./specialCases/accessorConstructors.js";
import {
  StatementsPriority,
  getBaselineStatementGetters,
} from "../fieldStatements/StatementsPriority.js";

// useful for debugging
void(ClassFieldStatementsMap);
void(ClassSupportsStatementsFlags);
void(DebuggingFilter);
// #endregion preamble

export default
async function createStructures(): Promise<void>
{
  initializeTypes();
  const names: readonly string[] = Array.from(
    InterfaceModule.structuresMap.keys()
  ).map(getStructureNameFromModified);

  await PromiseAllParallel(names, buildStructure);
}

async function buildStructure(
  name: string
): Promise<void>
{
  const interfaceModule = InterfaceModule.structuresMap.get(
    getClassInterfaceName(name)
  )!;

  const module = new StructureModule(name, interfaceModule);

  const interfaceMembers: TypeMembersMap = interfaceModule.typeMembers.clone();
  const replacedProperties = modifyTypeMembersForTypeStructures(name, interfaceMembers);

  const typeToClass = buildTypeToClass(module, interfaceModule);
  typeToClass.importFromTypeMembersMap(false, interfaceMembers);

  defineImplMethods(module, interfaceMembers, typeToClass, replacedProperties);
  typeToClass.defineStatementsByPurpose("body", false);
  defineClassCallbacks(typeToClass);
  insertConstructorKeys(module, typeToClass);

  try {
    module.classMembersMap = typeToClass.buildClassMembersMap();
  }
  catch (ex) {
    console.error("failed on module " + module.exportName);
    throw ex;
  }

  module.classMembersMap.getAsKind(
    StructureKind.Constructor, false, "constructor"
  )!.parameters.sort(compareConstructorParameters);

  postProcessClassMembers(module);

  removeUnnecessaryTypeStructures(module.classMembersMap);
  removeUnnecessaryMethods(module.classMembersMap);
  module.classMembersMap.forEach(
    classMember => addImportsToModule(module, classMember)
  );

  publicExports.addExports({
    pathToExportedModule: module.importManager.absolutePathToModule,
    isDefaultExport: true,
    isType: false,
    exportNames: [module.exportName]
  });

  await module.saveFile();
}

function buildTypeToClass(
  module: StructureModule,
  interfaceModule: InterfaceModule
): MemberedTypeToClass
{
  const typeToClass = new MemberedTypeToClass;
  addReadonlyArrayHandlers(module, interfaceModule.typeMembers, typeToClass);

  typeToClass.addStatementGetters(StatementsPriority.BASELINE, getBaselineStatementGetters(module));
  typeToClass.addStatementGetters(StatementsPriority.STRUCTURE_SPECIFIC, [
    new FixKeyType_Filter(module),
    new AccessorExtraParameters(module, typeToClass.constructorParameters),
    new ArrayReadonlyHandler(module),
    new KindPropertyInitializer(module),
    new CloneStructureStatements(module, typeToClass.constructorParameters),
    new ConstructorStatements(module, typeToClass.constructorParameters),
    new ShadowArrayStatements(module),
    new ProxyArrayStatements(module),
    new TypeStructureSetStatements(module),
    new TypeArrayStatements(module),
  ]);

  const flatTypes = InterfaceModule.flatTypesMap.get(
    getClassInterfaceName(module.baseName)
  )!;
  const isStaticProp = flatTypes.getAsKind(StructureKind.PropertySignature, "isStatic");
  if (isStaticProp) {
    typeToClass.addStatementGetters(
      StatementsPriority.IS_STATIC, [
        new IsStatic_Constructor(module, typeToClass.constructorParameters)
      ]
    );
    typeToClass.insertMemberKey(false, isStaticProp, false, "constructor");
  }

  const accessorProp = getInsertedAccessorProperty(module.baseName);
  if (accessorProp) {
    typeToClass.insertMemberKey(false, accessorProp, false, "constructor");
  }

  return typeToClass;
}

function defineImplMethods(
  module: StructureModule,
  interfaceMembers: TypeMembersMap,
  typeToClass: MemberedTypeToClass,
  replacedProperties: PropertySignatureImpl[],
): void
{
  const copyFieldsMethod = module.createCopyFieldsMethod(true);
  typeToClass.addTypeMember(true, copyFieldsMethod);
  typeToClass.addTypeMember(true, module.createStaticCloneMethod());

  const fromSignature = getFromSignatureMethod(module);
  if (fromSignature) {
    typeToClass.addTypeMember(true, fromSignature);
    const fromSignatureGetters = new FromSignatureStatements(module, typeToClass.constructorParameters);
    typeToClass.addStatementGetters(StatementsPriority.BASELINE, [fromSignatureGetters]);

    fromSignatureGetters.sharedKeys.forEach(sharedKey => {
      typeToClass.insertMemberKey(
        false,
        fromSignatureGetters.declarationFlatTypeMembers.get(sharedKey) as PropertySignatureImpl,
        true,
        fromSignature
      );
    });
  }

  let iteratorMethod: MethodSignatureImpl | undefined;
  {
    const properties = interfaceMembers.arrayOfKind(StructureKind.GetAccessor);
    if (properties.some(prop => PropertyHashesWithTypes.has(module.baseName, prop.name))) {
      iteratorMethod = module.createStructureIteratorMethod();
      typeToClass.addTypeMember(false, iteratorMethod);
    }
  }
  const toJSONMethod = module.createToJSONMethod();
  typeToClass.addTypeMember(false, toJSONMethod);

  replacedProperties.forEach(prop => {
    typeToClass.insertMemberKey(false, prop, true, copyFieldsMethod);
    if (iteratorMethod)
      typeToClass.insertMemberKey(false, prop, false, iteratorMethod);
    typeToClass.insertMemberKey(false, prop, false, toJSONMethod);
  });
}

function defineClassCallbacks(
  typeToClass: MemberedTypeToClass
): void
{
  typeToClass.isGeneratorCallback = {
    isGenerator: function(isStatic: boolean, memberName: string): boolean {
      return isStatic === false && memberName === "[STRUCTURE_AND_TYPES_CHILDREN]";
    }
  };
  typeToClass.scopeCallback = {
    getScope: function(
      isStatic: boolean,
      kind: ClassMemberImpl["kind"],
      memberName: string
    ): Scope | undefined
    {
      void(isStatic);
      void(kind);
      switch (memberName) {
        case "[COPY_FIELDS]":
        case "clone":
        case "fromSignature":
        case "toJSON":
        case "[STRUCTURE_AND_TYPES_CHILDREN]":
        return Scope.Public;
      }
      return undefined;
    }
  };
}

function insertConstructorKeys(
  module: StructureModule,
  typeToClass: MemberedTypeToClass
): void
{
  const properties = module.getFlatTypeMembers().arrayOfKind(StructureKind.PropertySignature);
  for (const property of properties) {
    if (property.hasQuestionToken)
      continue;
    if (property.name.startsWith("#"))
      continue;
    if (property.typeStructure?.kind === TypeStructureKind.Array)
      continue;
    if (property.typeStructure === booleanType)
      continue;
    if ((property.typeStructure?.kind === TypeStructureKind.Union) && property.typeStructure.childTypes.includes(TypeStructuresLiteral))
      continue;

    if (typeToClass.constructorParameters.find(param => param.name === property.name))
      continue;

    typeToClass.insertMemberKey(false, property, false, "constructor");
  }
}

// eslint complains when we say isAsync: boolean = false;
function removeUnnecessaryTypeStructures(
  classMembersMap: ClassMembersMap
): void
{
  classMembersMap.arrayOfKind(StructureKind.Property).forEach(
    prop => {
      if ((prop.typeStructure === booleanType) && prop.initializer) {
        prop.typeStructure = undefined;
      }
      else if ((prop.typeStructure === stringType) && prop.initializer && !prop.hasQuestionToken) {
        prop.typeStructure = undefined;
      }
    }
  );
}

function removeUnnecessaryMethods(
  classMembersMap: ClassMembersMap
): void
{
  const ctor = classMembersMap.getAsKind(StructureKind.Constructor, false, "constructor");
  if ((ctor?.statements.length === 1) && (ctor.statements[0] === "super();") && (ctor.parameters.length === 0)) {
    classMembersMap.delete("constructor");
  }

  const copyFieldsMethod = classMembersMap.getAsKind(StructureKind.Method, true, "[COPY_FIELDS]");
  if (copyFieldsMethod?.statements.length === 1) {
    classMembersMap.delete(COPY_FIELDS_NAME);
  }
}

function compareConstructorParameters(
  a: ParameterDeclarationImpl,
  b: ParameterDeclarationImpl,
): number
{
  if (a.name === "isStatic")
    return -1;
  if (b.name === "isStatic")
    return +1;

  if (a.name === "name")
    return -1;
  if (b.name === "name")
    return +1;

  return a.name.localeCompare(b.name);
}

const booleanType = LiteralTypeStructureImpl.get("boolean");
const stringType = LiteralTypeStructureImpl.get("string");
const TypeStructuresLiteral = LiteralTypeStructureImpl.get("TypeStructures");
