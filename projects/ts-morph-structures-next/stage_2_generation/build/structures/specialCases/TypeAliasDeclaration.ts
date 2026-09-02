//#region preamble
import assert from "node:assert/strict";

import {
  StructureKind,
} from "ts-morph";

import {
  LiteralTypeStructureImpl,
  type MemberedTypeToClass,
  type ParameterDeclarationImpl,
  UnionTypeStructureImpl,
} from "#stage_one/snapshot/source/exports.js";

import type InterfaceModule from "../../../moduleClasses/InterfaceModule.js";
import type {
  StructureModule
} from "../../../moduleClasses/StructureModule.js";

import BlockStatementImpl from "../../../pseudoExpressions/statements/BlockStatement.js";

import type {
  StructureModuleModifierTraps
} from "../../../types/StructureModuleModifierTraps.js";

import {
  StatementsPriority,
} from "../../fieldStatements/StatementsPriority.js";

import {
  TypeAliasDeclarationInitializer
} from "./utilities/TypeAlias_TypeInitializer.js";
//#endregion preamble

export const TypeAliasDeclarationSpecialCases: StructureModuleModifierTraps = {
  modifyTypeMembersForTypeStructures(baseName, map) {
    void baseName;
    // special case: type can never be undefined
    const typeStructureMember = map.getAsKind(StructureKind.PropertySignature, "typeStructure")!;
    typeStructureMember.typeStructure = LiteralTypeStructureImpl.get("TypeStructures");
  },

  buildTypeToClass(module: StructureModule, interfaceModule: InterfaceModule, typeToClass: MemberedTypeToClass) {
    void interfaceModule;
    typeToClass.addStatementGetters(StatementsPriority.SPECIAL_CASES, [
      new TypeAliasDeclarationInitializer(module)
    ]);
  },

  postProcessClassMembers(module: StructureModule): void {
    // allowTypeStructureInConstructor
    {
      assert(module.classMembersMap);

      const ctor = module.classMembersMap.getAsKind(StructureKind.Constructor, false, "constructor")!;

      module.addImports("public", [], ["stringOrWriterFunction", "TypeStructures"]);
      const typeParam: ParameterDeclarationImpl = ctor.parameters.find(param => param.name === "type")!;
      typeParam.typeStructure = new UnionTypeStructureImpl([
        LiteralTypeStructureImpl.get("stringOrWriterFunction"),
        LiteralTypeStructureImpl.get("TypeStructures")
      ]);

      ctor.statements.splice(
        ctor.statements.indexOf("this.type = type;"),
        1,
        new BlockStatementImpl(
          `if (typeof type === "object")`,
          [`this.typeStructure = type;`]
        ).writerFunction,

        new BlockStatementImpl(
          `else`,
          [ `this.type = type;`]
        ).writerFunction,
      );
    }
  }
};
