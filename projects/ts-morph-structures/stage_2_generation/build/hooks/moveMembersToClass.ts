import StructureDictionaries, {
  DecoratorParts,
  StructureParts,
} from "#stage_two/generation/build/StructureDictionaries.js";

import {
  DecoratorImplMeta,
  StructureImplMeta,
} from "#stage_two/generation/build/structureMeta/DataClasses.js";

export default function moveMembersToClass(
  name: string,
  meta: DecoratorImplMeta | StructureImplMeta,
  dictionaries: StructureDictionaries
): void
{
  let parts: DecoratorParts | StructureParts;
  if (meta instanceof DecoratorImplMeta) {
    parts = dictionaries.decoratorParts.get(meta)!;
  } else {
    parts = dictionaries.structureParts.get(meta)!;
  }

  parts.classMembersMap.moveMembersToClass(parts.classDecl, [parts.classFieldsStatements]);
}
