//#region preamble
import assert from "node:assert";
import fs from "node:fs/promises";

import {
  input,
  select,
} from "@inquirer/prompts";

import {
  type EnumDeclaration,
  printStructure,
  type SourceFile,
  StructureKind,
  SyntaxKind
} from "ts-morph";

import {
  type ExportDeclarationImpl,
  type ExportAssignmentImpl,
  ImportManager,
  VoidTypeNodeToTypeStructureConsole,
  getTypeAugmentedStructure,
  type SourceFileImpl,
} from "#stage_one/snapshot/dist/exports.js";

import CallExpression from "#stage_two/generation/pseudoExpressions/statements/CallExpression.js";
import BlockStatement from "#stage_two/generation/pseudoExpressions/statements/BlockStatement.js";
import SatisfiesStatement from "#stage_two/generation/pseudoExpressions/statements/SatisfiesStatement.js";

import getTS_SourceFile from "#utilities/source/getTS_SourceFile.js";

import {
  stageDir
} from "../pre-build/constants.js";
import { pathToModule } from "#utilities/source/AsyncSpecModules.js";
//#endregion preamble

const className = await input({
  message: "What is the class name of the new type structure?"
});

const newKind = await input({
  message: "What TypeStructureKind should I define?"
});

const baseClassName = await select<string>({
  message: "Which base type structures class should I use?",
  choices: [
    "TypeStructuresBase",
    "TypeStructuresWithChildren",
    "TypeStructuresWithTypeChildren",
  ],
});

await Promise.all([
  updateTypeStructureKind(),
  buildStubTypeStructure(),
  addToTypeStructuresUnion(),
]);

async function updateTypeStructureKind(): Promise<void> {
  const sourceFile: SourceFile = getTS_SourceFile(stageDir, "snapshot/source/base/TypeStructureKind.ts");

  const enumStatement: EnumDeclaration = sourceFile.getStatementByKindOrThrow(SyntaxKind.EnumDeclaration);
  enumStatement.addMember(newKind);

  await sourceFile.save();
}

async function buildStubTypeStructure(): Promise<void> {
  const stubPath: string = `utilities/stubs/type/${baseClassName}.subclass.ts`;
  let contents: string = await fs.readFile(pathToModule(stageDir, stubPath), { encoding: "utf-8" });
  contents = contents.replaceAll(`SubclassTypeStructureImpl`, className);
  contents = contents.replaceAll(`TypeStructureKind.Import`, `TypeStructureKind.${newKind}`);

  const targetPath: string = `source/structures/type/${className}.ts`;
  await fs.writeFile(targetPath, contents, { encoding: "utf-8"});
}

async function addToTypeStructuresUnion(): Promise<void> {
  throw new Error("addToTypeStructuresUnion: not yet implemented");
}
