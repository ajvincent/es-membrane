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
      const baseClass: ClassDeclaration | undefined = classDecl.getBaseClass();// ?? extrapolateBaseClass(classDecl);
      if (!baseClass) {
        continue;
      }
      classToDerivedMap.getDefault(baseClass, () => []).push(classDecl);
    }
  }

  return classToDerivedMap;
}
