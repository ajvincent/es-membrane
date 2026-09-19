import {
  performance
} from "node:perf_hooks";

import type {
  ClassDeclaration,
} from "ts-morph";

import {
  monorepoRoot
} from "@ajvincent/build-utilities";

import getTS_SourceFile from "./getTS_SourceFile.js";

import {
  DefaultMap
} from "./DefaultMap.js";

const start = performance.now();
export const TS_MORPH_D = getTS_SourceFile({
  isAbsolutePath: true,
  pathToDirectory: monorepoRoot
}, "node_modules/ts-morph/lib/ts-morph.d.ts");

const end = performance.now();

console.log("time to load ts-morph.d.ts: " + (end - start) + "ms");

const classToDerivedMap = new DefaultMap<ClassDeclaration, ClassDeclaration[]>;

export function getClassToDerivedMap(): ReadonlyMap<ClassDeclaration, readonly ClassDeclaration[]>
{
  if (classToDerivedMap.size === 0) {
    const allClasses: readonly ClassDeclaration[] = TS_MORPH_D.getClasses();
    for (const classDecl of allClasses) {
      const baseClass: ClassDeclaration | undefined = classDecl.getBaseClass();
      if (!baseClass) {
        continue;
      }
      classToDerivedMap.getDefault(baseClass, () => []).push(classDecl);
    }
  }

  return classToDerivedMap;
}

export function getLeafSubclassesClassesOf(
  branchClassName: string
): ReadonlyMap<string, ClassDeclaration>
{
  const leafClasses = new Map<string, ClassDeclaration>;
  const classToDerivedMap: ReadonlyMap<ClassDeclaration, readonly ClassDeclaration[]> = getClassToDerivedMap();
  const allClasses = new Set<ClassDeclaration>([TS_MORPH_D.getClassOrThrow(branchClassName)]);

  for (const classDecl of allClasses) {
    const derivedClasses: readonly ClassDeclaration[] = classToDerivedMap.get(classDecl) ?? [];
    if (derivedClasses.length === 0) {
      leafClasses.set(classDecl.getNameOrThrow(), classDecl);
    }
    else {
      for (const subclassDecl of derivedClasses) {
        allClasses.add(subclassDecl);
      }
    }
  }

  return leafClasses;
}

