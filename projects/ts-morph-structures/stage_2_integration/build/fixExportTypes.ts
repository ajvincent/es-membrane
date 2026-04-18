import assert from "node:assert/strict";

import {
  StructureKind,
  type MethodSignatureStructure,
  type OptionalKind,
  type PropertySignatureStructure,
  type SourceFile,
  type TypeNode
} from "ts-morph";

import getTS_SourceFile from "#utilities/source/getTS_SourceFile.js";

import {
  forEachAugmentedStructureChild,
  getTypeAugmentedStructure,
  StructureImpls,
  TypeStructures,
  TypeStructureKind,
  type MemberedObjectTypedStructure,
  type SourceFileImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import {
  stageDir
} from "../pre-build/constants.js";

export async function fixExportTypes(): Promise<void>
{
  const sourceFile: SourceFile = getTS_SourceFile(stageDir, "snapshot/dist/exports.d.ts");
  function parseConsole(
    message: string,
    failingTypeNode: TypeNode,
  ): void {
    void(message);
    void(failingTypeNode);
  }

  const { rootStructure, failures } = getTypeAugmentedStructure(sourceFile, parseConsole);
  assert.deepStrictEqual(failures, [], "unknown structure failures");
  assert(rootStructure.kind === StructureKind.SourceFile);

  forEachAugmentedStructureChild(rootStructure as SourceFileImpl, recurseStructures);

  sourceFile.set(rootStructure);
  await sourceFile.save();
}

function recurseStructures(child: StructureImpls | TypeStructures): void {
  if (child.kind === TypeStructureKind.MemberedObject) {
    sortClassMembers(child);
  }
  else {
    forEachAugmentedStructureChild(child, recurseStructures);
  }
}

function sortClassMembers(
  memberedObject: MemberedObjectTypedStructure,
): void
{
  memberedObject.properties?.sort(sortMembers);
  memberedObject.methods?.sort(sortMembers);
}

function sortMembers(
  a: Readonly<OptionalKind<MethodSignatureStructure> | OptionalKind<PropertySignatureStructure>>,
  b: Readonly<OptionalKind<MethodSignatureStructure> | OptionalKind<PropertySignatureStructure>>
): number
{
  if (a.name === "kind")
    return -1;
  if (b.name === "kind")
    return +1;

  return a.name.localeCompare(b.name);
}
