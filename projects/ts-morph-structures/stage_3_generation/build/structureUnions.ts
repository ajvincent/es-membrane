import {
  LiteralTypeStructureImpl,
  TypeAliasDeclarationImpl,
  UnionTypeStructureImpl,
} from "#stage_two/snapshot/source/exports.js";

import {
  getStructureImplName,
  getUnionOfStructuresName,
} from "#utilities/source/StructureNameTransforms.js";

import {
  UnionModule
} from "../moduleClasses/exports.js";

import initializeTypes from "../vanilla/initializer.js";
import UnionMap from "../vanilla/UnionMap.js";

/**
 * @returns the original structure names (not modified by getStructureImplName)
 */
export default
async function fillStructureUnions(): Promise<readonly string[]>
{
  initializeTypes();
  const structures = addStructureUnion("Structures");
  await UnionModule.saveFile();
  return structures;
}

function addStructureUnion(
  aliasName: string
): string[]
{
  const originalNames = UnionMap.get(aliasName)!;
  const unionStructure = new UnionTypeStructureImpl;

  const structures: string[] = [], unions: string[] = [];
  originalNames.forEach(child => {
    if (child.endsWith("Structures")) {
      const newName = getUnionOfStructuresName(child);
      unionStructure.childTypes.push(LiteralTypeStructureImpl.get(newName))
      unions.push(newName);
      structures.push(...addStructureUnion(child));
    }
    else {
      const newName = getStructureImplName(child);
      unionStructure.childTypes.push(LiteralTypeStructureImpl.get(newName));
      structures.push(child);
    }
  });

  unionStructure.childTypes.sort((a, b): number =>
    (a as LiteralTypeStructureImpl).stringValue.localeCompare((b as LiteralTypeStructureImpl).stringValue)
  );

  UnionModule.addImports("public", [], structures.map(getStructureImplName));
  UnionModule.addStarExport(true, true);

  const typeAlias = new TypeAliasDeclarationImpl(getUnionOfStructuresName(aliasName), unionStructure);
  typeAlias.isExported = true;
  UnionModule.aliases.set(typeAlias.name, typeAlias);

  return structures;
}
