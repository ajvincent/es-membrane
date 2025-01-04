import StructureDictionaries from "#stage_two/generation/build/StructureDictionaries.js";

import {
  StructureImplMeta
} from "#stage_two/generation/build/structureMeta/DataClasses.js";

import {
  COPY_FIELDS_NAME
} from "../../constants.js";

export default function removeUselessCopyFields(
  name: string,
  meta: StructureImplMeta,
  dictionaries: StructureDictionaries
): void
{
  const parts = dictionaries.structureParts.get(meta)!;
  const copyFields = parts.classFieldsStatements.groupStatementsMap(COPY_FIELDS_NAME);

  if (copyFields!.size === 1) {
    parts.classMembersMap.delete(COPY_FIELDS_NAME);
  }
}
