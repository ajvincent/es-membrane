import {
  TypeStructureClassesMap,
  type TypeStructures,
} from "../exports.js";

export default function replaceDescendantTypeStructures<
  ParentTypeStructure extends TypeStructures | TypeStructures[]
>
(
  parentObject: ParentTypeStructure,
  propertyName: keyof ParentTypeStructure,
  filter: (typeStructure: TypeStructures) => boolean,
  replacement: TypeStructures
): void
{
  if (filter(parentObject[propertyName] as TypeStructures))
    (parentObject[propertyName] as TypeStructures) = TypeStructureClassesMap.clone(replacement);
  else
    (parentObject[propertyName] as TypeStructures).replaceDescendantTypes(filter, replacement);
}
