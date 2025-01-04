import assert from "node:assert/strict";

import {
  getStructureNameFromModified
} from "#utilities/source/StructureNameTransforms.js";

import InterfaceModule from "../../moduleClasses/InterfaceModule.js";
import removeStaticableDecorator from "./removeStaticableDecorator.js";

export default function mergeInterfaces(): void {
  {
    let count = 0;
    for (count = 0; count < 5; count++) {
      if (moveSubDecoratorsToStructures() === false)
        break;
    }
    assert(count < 5, "runaway loop?");
  }

  removeStaticableDecorator();
  removeUnnecessaryDecorators();
}

function moveSubDecoratorsToStructures(): boolean {
  const structureRefMap = getExtendsReferences(InterfaceModule.structuresMap);
  const decoratorRefMap = getExtendsReferences(InterfaceModule.decoratorsMap);

  let foundAny = false;

  for (const [decoratorFile, decoratorExtends] of decoratorRefMap) {
    const decoratorKey = getStructureNameFromModified(decoratorFile);
    if (decoratorExtends.size === 0)
      continue;

    let foundSubDecorator = false;
    for (const [structureKey, structureExtends] of structureRefMap) {
      if (structureExtends.has(decoratorKey) === false)
        continue;
      const structureModule = InterfaceModule.structuresMap.get(structureKey)!;

      for (const childExtends of decoratorExtends) {
        if (structureModule.extendsSet.has(childExtends))
          continue;
        foundSubDecorator = true;
        structureModule.extendsSet.add(childExtends);
      }
    }

    if (foundSubDecorator) {
      foundAny = true;
    }
    else {
      InterfaceModule.decoratorsMap.get(decoratorFile)!.extendsSet.clear();
    }
  }

  if (foundAny === false) {
    const allDecoratorRefs: string[] = Array.from(
      getExtendsReferences(InterfaceModule.decoratorsMap).values()
    ).map(refSet => Array.from(refSet)).flat();
    assert.equal(allDecoratorRefs.length, 0);
  }

  return foundAny;
}

function getExtendsReferences(
  map: ReadonlyMap<string, InterfaceModule>
): ReadonlyMap<string, Set<string>>
{
  const entries: [string, Set<string>][] = [];
  for (const [key, module] of map.entries() ) {
    entries.push([key, new Set<string>(module.extendsSet)]);
  }

  return new Map(entries);
}

function removeUnnecessaryDecorators(): void {
  interface referencesAndModule {
    references: string[],
    module: InterfaceModule
  }

  const decoratorsReferencedByMap = new Map<string, referencesAndModule>;
  for (const [key, module] of InterfaceModule.decoratorsMap.entries()) {
    decoratorsReferencedByMap.set(getStructureNameFromModified(key), {references: [], module});
  }

  for (const [structureKey, module] of InterfaceModule.structuresMap) {
    module.extendsSet.forEach(
      extendsKey => decoratorsReferencedByMap.get(extendsKey)!.references.push(structureKey)
    );
  }

  for (const [decoratorKey, {references, module}] of decoratorsReferencedByMap.entries()) {
    if (module.typeMembers.size === 0) {
      references.forEach(structureKey => {
        const structureModule = InterfaceModule.structuresMap.get(structureKey)!;
        structureModule.extendsSet.delete(decoratorKey);
      });

      references.splice(0, references.length);
    }

    if (references.length > 1)
      continue;

    if (references.length === 1) {
      const structureKey = references.pop()!;
      const structureModule = InterfaceModule.structuresMap.get(structureKey)!;
      structureModule.typeMembers.addMembers(Array.from(module.typeMembers.values()));
      structureModule.extendsSet.delete(getStructureNameFromModified(module.defaultExportName));
    }

    if (references.length === 0) {
      InterfaceModule.decoratorsMap.delete(module.defaultExportName);
    }
  }

  // todo: remove Structures, which should be on every structure

  for (const { extendsSet } of InterfaceModule.structuresMap.values()) {
    extendsSet.sort((a, b): number => {
      return decoratorsReferencedByMap.get(a)!.references.length -
        decoratorsReferencedByMap.get(b)!.references.length
    });
  }
}
