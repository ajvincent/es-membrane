import BaseClassModule from "#stage_three/generation/moduleClasses/BaseClassModule.js";
import StructureModule from "#stage_three/generation/moduleClasses/StructureModule.js";
import ArrayBooleanAndString from "./ArrayBooleanAndString.js";
import CopyFieldsStatements from "./CopyFields.js";
import StatementGetterBase from "./GetterBase.js";
import StructureIteratorStatements from "./StructureIterator.js";
import ToJSONStatements from "./ToJSON.js";
import TypeManagerStatements from "./TypeStructures/Manager.js";
import TypeStructureGetterStatements from "./TypeStructures/StructureGetter.js";
import TypeGetterStatements from "./TypeStructures/TypeGetter.js";
import UndefinedProperties from "./UndefinedProperties.js";

export enum StatementsPriority {
  DEBUG = 0,
  IS_STATIC,
  STRUCTURE_SPECIFIC,
  DECORATOR_SPECIFIC,
  BASELINE,
}

export function getBaselineStatementGetters(
  module: BaseClassModule
): StatementGetterBase[]
{
  return [
    new ArrayBooleanAndString(module, module instanceof StructureModule),
    new CopyFieldsStatements(module),
    new ToJSONStatements(module),
    new StructureIteratorStatements(module),
    new TypeManagerStatements(module),
    new TypeGetterStatements(module),
    new TypeStructureGetterStatements(module),

    // this is last, because anything with a value we should've filtered out by now.
    new UndefinedProperties(module),
  ];
}
