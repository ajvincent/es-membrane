import assert from "node:assert/strict";

import {
  Scope,
  StructureKind,
} from "ts-morph";

import {
  ClassFieldStatementsMap,
  type ClassMemberImpl,
  LiteralTypeStructureImpl,
  MemberedTypeToClass,
  type TypeMembersMap,
  MethodSignatureImpl,
} from "#stage_two/snapshot/source/exports.js";

import {
  PromiseAllParallel,
} from "#utilities/source/PromiseTypes.js";

import {
  getClassInterfaceName,
  getStructureNameFromModified,
} from "#utilities/source/StructureNameTransforms.js";

import modifyTypeMembersForTypeStructures from "../classTools/modifyTypeMembersForTypeStructures.js";

import CloneStatement_Statements from "./CloneStatement.js";

import {
  addImportsToModule,
  DecoratorModule,
  InterfaceModule,
  internalExports,
} from "../../moduleClasses/exports.js";

import DebuggingFilter from "../fieldStatements/Debugging.js";
import {
  StatementsPriority,
  getBaselineStatementGetters,
} from "../fieldStatements/StatementsPriority.js";

void(ClassFieldStatementsMap);
void(DebuggingFilter);

export default
async function createDecorators(): Promise<void>
{
  const names: string[] = Array.from(
    InterfaceModule.decoratorsMap.keys()
  ).map(getStructureNameFromModified);

  await PromiseAllParallel(names, buildDecorator);
}

async function buildDecorator(
  name: string
): Promise<void>
{
  const module = new DecoratorModule(name);
  const interfaceMembers: TypeMembersMap = InterfaceModule.decoratorsMap.get(
    getClassInterfaceName(name)
  )!.typeMembers.clone();
  assert(interfaceMembers.size > 0, "Empty interface?  Or was it just consumed?  " + name);

  const replacedProperties = modifyTypeMembersForTypeStructures(name, interfaceMembers);

  const typeToClass = new MemberedTypeToClass;
  typeToClass.importFromTypeMembersMap(false, interfaceMembers);
  typeToClass.addStatementGetters(StatementsPriority.BASELINE, getBaselineStatementGetters(module));

  // stage two sorts the type members... we don't.

  let structureIterator: MethodSignatureImpl | undefined;

  const copyFieldsMethod = module.createCopyFieldsMethod(false);
  typeToClass.addTypeMember(true, copyFieldsMethod);
  {
    const properties = interfaceMembers.arrayOfKind(StructureKind.PropertySignature);
    if (properties.some(prop => /^#.*Manager$/.test(prop.name))) {
      structureIterator = module.createStructureIteratorMethod();
      typeToClass.addTypeMember(false, structureIterator);
    }
  }
  const toJSONMethod = module.createToJSONMethod();
  typeToClass.addTypeMember(false, toJSONMethod);

  if (name.startsWith("StatementedNode")) {
    const cloneStatementFilter = new CloneStatement_Statements(module);
    typeToClass.addStatementGetters(StatementsPriority.DECORATOR_SPECIFIC, [cloneStatementFilter]);
    typeToClass.addTypeMember(true, cloneStatementFilter.getMethodSignature());
  }

  replacedProperties.forEach(prop => {
    typeToClass.insertMemberKey(false, prop, true, copyFieldsMethod);
    if (structureIterator)
      typeToClass.insertMemberKey(false, prop, false, structureIterator);
    typeToClass.insertMemberKey(false, prop, false, toJSONMethod);
  });

  typeToClass.defineStatementsByPurpose("body", false);

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
        case "toJSON":
        case "[STRUCTURE_AND_TYPES_CHILDREN]":
        return Scope.Public;
      }
      return undefined;
    }
  };

  module.classMembersMap = typeToClass.buildClassMembersMap();

  // eslint complains when we say isAsync: boolean = false;
  module.classMembersMap.arrayOfKind(StructureKind.Property).forEach(
    prop => {
      if ((prop.typeStructure === booleanType) && prop.initializer) {
        prop.typeStructure = undefined;
      }
      if ((prop.typeStructure === stringType) && prop.initializer && !prop.hasQuestionToken) {
        prop.typeStructure = undefined;
      }
    }
  );

  module.classMembersMap.forEach(
    classMember => addImportsToModule(module, classMember)
  );

  internalExports.addExports({
    pathToExportedModule: module.importManager.absolutePathToModule,
    isDefaultExport: true,
    isType: false,
    exportNames: [module.defaultExportName]
  });

  internalExports.addExports({
    pathToExportedModule: module.importManager.absolutePathToModule,
    isDefaultExport: false,
    isType: true,
    exportNames: [module.fieldsName]
  });

  await module.saveFile();
}

const booleanType = LiteralTypeStructureImpl.get("boolean");
const stringType = LiteralTypeStructureImpl.get("string");
