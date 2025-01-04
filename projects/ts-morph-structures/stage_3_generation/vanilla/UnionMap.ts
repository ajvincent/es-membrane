import assert from "node:assert/strict";

import {
  StructureKind
} from "ts-morph";

import {
  TypeStructureKind,
  VoidTypeNodeToTypeStructureConsole,
  getTypeAugmentedStructure,
} from "#stage_two/snapshot/source/exports.js";

import TS_MORPH_D from "#utilities/source/ts-morph-d-file.js";

import {
  requireInterface
} from "./InterfaceMap.js";

const UnionMapInternal = new Map<string, readonly string[]>;

const UnionMap = UnionMapInternal as ReadonlyMap<string, readonly string[]>;
export default UnionMap;

export function requireUnion(
  name: string
): void
{
  const aliasNode = TS_MORPH_D.getTypeAliasOrThrow(name);
  const aliasStructure = getTypeAugmentedStructure(
    aliasNode, VoidTypeNodeToTypeStructureConsole, true, StructureKind.TypeAlias
  ).rootStructure;

  const typeList = aliasStructure.typeStructure;

  const identifiers: string[] = [];

  if (typeList?.kind === TypeStructureKind.Literal) {
    identifiers.push(typeList.stringValue);
  } else {
    assert.equal(
      typeList?.kind,
      TypeStructureKind.Union,
      `found typeList.kind ${TypeStructureKind[typeList!.kind]} for name ${name}`
    );

    for (const childType of typeList.childTypes) {
      assert.equal(
        childType.kind,
        TypeStructureKind.Literal,
        `actual kind for name ${name} is ${TypeStructureKind[childType.kind]}`
      );
      identifiers.push(childType.stringValue);
    }
  }

  UnionMapInternal.set(name, identifiers.slice());
  identifiers.forEach(id => {
    if (id.endsWith("Structures"))
      requireUnion(id);
    else if (id.endsWith("Structure"))
      requireInterface(id);
  });
}
