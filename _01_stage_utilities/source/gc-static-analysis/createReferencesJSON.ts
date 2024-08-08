//#region preamble
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

import readDirsDeep from "#build-utilities/source/readDirsDeep.js";

import {
  SourceClassMethod,
  SourceClassReferences
} from "./JSONClasses/SourceClass.js";

import {
  PromiseAllParallel
} from "../PromiseTypes.mjs";

import extractClassesForProgram from "./ast-tools/extractClassesForProgram.js";

import {
  analyze,
  type ScopeManager,
} from '@typescript-eslint/scope-manager';

import {
  parse,
  type TSESTree,
} from '@typescript-eslint/typescript-estree';

import {
  projectDir
} from "../AsyncSpecModules.mjs";

import organizeClassMembers, {
  type AST_ClassMembers
} from "./ast-tools/organizeClassMembers.js";

import buildMethodReferences from "./ast-tools/buildMethodReferences.js";

import {
  findSuperClass
} from "./ast-tools/findClassInAST.js";

import parseSourceFile from "./ast-tools/parseSourceFile.js";

//#endregion preamble

export default
async function createReferencesJSON(
  pathToDirectory: string
): Promise<void>
{
  let sourceClassRecords: Record<string, SourceClassReferences> = {};

  let { files } = await readDirsDeep(path.join(projectDir, pathToDirectory));
  files = files.filter(f => path.extname(f) === ".ts" || path.extname(f) === ".mts");

  await PromiseAllParallel(files, f => defineClassesForFile(f, sourceClassRecords));

  {
    const entries = Object.entries(sourceClassRecords);
    entries.sort(([aName, aObj], [bName, bObj]) => aName.localeCompare(bName));
    sourceClassRecords = Object.fromEntries(entries);
  }

  await fs.writeFile(
    path.join(projectDir, pathToDirectory, "class-references.json"),
    JSON.stringify(sourceClassRecords, null, 2) + "\n",
    { "encoding": "utf-8" }
  );
}

async function defineClassesForFile(
  pathToTypeScriptFile: string,
  sourceClassRecords: Record<string, SourceClassReferences>
): Promise<void>
{
  const program: TSESTree.Program = await parseSourceFile(pathToTypeScriptFile);
  const moduleScope: ScopeManager = analyze(program, {
    sourceType: "module"
  });

  const classList: TSESTree.ClassDeclarationWithName[] = extractClassesForProgram(program);

  for (const tsESTree_Class of classList) {
    assert(tsESTree_Class.id, "no id?");
    const sourceClass = new SourceClassReferences;
    sourceClassRecords[tsESTree_Class.id.name] = sourceClass;

    sourceClass.fileLocation = pathToTypeScriptFile;
    if (tsESTree_Class.superClass) {
      sourceClass.extendsClass = findSuperClass(tsESTree_Class);
    }

    const members: AST_ClassMembers = organizeClassMembers(tsESTree_Class);
    for (const [methodName, tsESTree_Method] of members.MethodDefinitions) {
      const sourceMethod = new SourceClassMethod;
      sourceClass.methods[methodName] = sourceMethod;
      buildMethodReferences(sourceMethod, tsESTree_Method, moduleScope);
    }
  }
}
