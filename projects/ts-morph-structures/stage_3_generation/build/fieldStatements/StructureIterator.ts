import assert from "node:assert/strict";

import {
  StructureKind
} from "ts-morph";

import {
  ClassBodyStatementsGetter,
  ClassHeadStatementsGetter,
  ClassSupportsStatementsFlags,
  MemberedStatementsKey,
  TypeStructureKind,
  TypeStructures,
  type stringWriterOrStatementImpl
} from "#stage_two/snapshot/source/exports.js";

import BlockStatementImpl from "../../pseudoExpressions/statements/BlockStatement.js";
import PropertyHashesWithTypes from "../classTools/PropertyHashesWithTypes.js";
import StatementGetterBase from "./GetterBase.js";
import BaseClassModule from "#stage_three/generation/moduleClasses/BaseClassModule.js";

export default class StructureIteratorStatements extends StatementGetterBase
implements ClassHeadStatementsGetter, ClassBodyStatementsGetter
{
  constructor(
    module: BaseClassModule
  )
  {
    super(
      module,
      "StructureIteratorStatements",
      ClassSupportsStatementsFlags.HeadStatements |
      ClassSupportsStatementsFlags.BodyStatements
    );
  }

  filterHeadStatements(key: MemberedStatementsKey): boolean {
    return (key.statementGroupKey === "[STRUCTURE_AND_TYPES_CHILDREN]");
  }
  getHeadStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    void(key);
    return [`yield* super[STRUCTURE_AND_TYPES_CHILDREN]();`];
  }

  filterBodyStatements(key: MemberedStatementsKey): boolean {
    if (key.statementGroupKey !== "[STRUCTURE_AND_TYPES_CHILDREN]")
      return false;
    return PropertyHashesWithTypes.has(this.module.baseName, key.fieldKey);
  }
  getBodyStatements(key: MemberedStatementsKey): readonly stringWriterOrStatementImpl[] {
    assert(
      key.fieldType?.kind === StructureKind.GetAccessor || key.fieldType?.kind === StructureKind.PropertySignature,
      `${this.module.exportName}:${key.fieldKey} kind is not PropertySignature`
    )

    let typeStructure: TypeStructures;
    if (key.fieldType.kind === StructureKind.GetAccessor)
      typeStructure = key.fieldType.returnTypeStructure!;
    else
      typeStructure = key.fieldType.typeStructure!;

    if (typeStructure.kind === TypeStructureKind.Array) {
      return [
        new BlockStatementImpl(
          `for (const typeStructure of this.${key.fieldKey}Set)`,
          [
            `if (typeof typeStructure === "object") yield typeStructure;`
          ]
        ).writerFunction,
      ];
    }

    const propertyName = key.fieldKey + "Structure";
    return [
      `if (typeof this.${propertyName} === "object") yield this.${propertyName};`
    ]
  }
}
