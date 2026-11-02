import {
  StructureKind
} from "ts-morph";

import type {
  Class,
} from "type-fest";

import type {
  AugmentedStatementStructures,
  KindedStatementStructure,
  StatementStructureKind,
} from "../../snapshot/source/exports.js";

import type {
  CloneableStatementStructure
} from "../../snapshot/source/internal-exports.js";

import StructureClassesMap from "./StructureClassesMap.js";

class StatementStructureClassesMapClass extends Map<
  StatementStructureKind,
  CloneableStatementStructure<AugmentedStatementStructures> &
    Class<KindedStatementStructure<StatementStructureKind>>
>
{
  clone(
    structure: AugmentedStatementStructures
  ): AugmentedStatementStructures
  {
    switch (structure.kind) {
      case StructureKind.Class:
      case StructureKind.Enum:
      case StructureKind.ExportAssignment:
      case StructureKind.ExportDeclaration:
      case StructureKind.Function:
      case StructureKind.ImportDeclaration:
      case StructureKind.Interface:
      case StructureKind.Module:
      case StructureKind.TypeAlias:
      case StructureKind.VariableStatement:
        return StructureClassesMap.clone(structure);
    }

    return this.get(structure.kind)!.clone(structure);
  }

  cloneArray(
    structures: (AugmentedStatementStructures)[]
  ): AugmentedStatementStructures[]
  {
    return structures.map(structure => this.clone(structure));
  }
}

const StatementStructureClassesMap = new StatementStructureClassesMapClass;
export {
  StatementStructureClassesMap
};
