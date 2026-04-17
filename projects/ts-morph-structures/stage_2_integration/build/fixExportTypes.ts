import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

import type {
  SourceFile,
  TypeNode
} from "ts-morph";

import {
  pathToModule,
  projectDir,
} from "#utilities/source/AsyncSpecModules.js";

import getTS_SourceFile from "#utilities/source/getTS_SourceFile.js";

import {
  getTypeAugmentedStructure,
  type TypeNodeToTypeStructureConsole,
  type RootStructureWithConvertFailures,
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

  debugger;
  const { rootStructure, failures } = getTypeAugmentedStructure(sourceFile, parseConsole);
  assert.deepStrictEqual(failures, [], "unknown structure failures");
}
