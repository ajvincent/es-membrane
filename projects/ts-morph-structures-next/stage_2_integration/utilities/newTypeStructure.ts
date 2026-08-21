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
  TypeStructureKind,
  VoidTypeNodeToTypeStructureConsole,
  getTypeAugmentedStructure,
  type SourceFileImpl,
  LiteralTypeStructureImpl,
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

const newKind = await input({
  message: "What TypeStructureKind should I define?"
});

const className = await input({
  message: "What is the class name of the new type structure?",
  default: newKind + "TypeStructureImpl"
});

const baseClassName = await select<string>({
  message: "Which base type structures class should I use?",
  choices: [
    "TypeStructuresBase",
    "TypeStructuresWithChildren",
    "TypeStructuresWithTypeParameters",
  ],
});

await Promise.all([
  updateTypeStructureKind(),
  buildStubTypeStructure(),
  addToTypeStructuresUnion(),
]);

const WithChildrenRequirements = `
- TypeStructuresWithChildren's second parameter, if it is too loose
- objectType
- childTypes
- startToken
- joinChildrenToken
- endToken
- maxChildCount
`.trim();

const StandardRequirements = `
- STRUCTURE_AND_TYPES_CHILDREN
- #writerFunction
`.trim();

console.log(`
Your stub class file should now be at "source/structures/type/${className}.ts".

You are still responsible for filling out:

- the "@example" tag
- constructor
- static clone()
${
  baseClassName === "TypeStructuresWithChildren" ?
  WithChildrenRequirements :
  StandardRequirements
}

You also need to:
- [ ] Update source/bootstrap/convertTypeNode.ts for the new structure and its matching type node.
- [ ] Do a build, so the new type structure class arrives in the final snapshot
- [ ] Update ../stage_2_snapshot/spec-snapshot/source/structures/TypeStructures.ts as you see fit.
- [ ] Update /docs/guides/TypeStructures.md to include the new type structure.

`.trim());

async function updateTypeStructureKind(): Promise<void> {
  const sourceFile: SourceFile = getTS_SourceFile(stageDir, "source/base/TypeStructureKind.ts");

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
  const absolutePath = pathToModule(stageDir, "source/structures/type/TypeStructures.ts");
  const sourceFile: SourceFile = getTS_SourceFile(stageDir, "source/structures/type/TypeStructures.ts");
  const sourceFileStructure: SourceFileImpl = getTypeAugmentedStructure(
    sourceFile, VoidTypeNodeToTypeStructureConsole, true, StructureKind.SourceFile
  ).rootStructure;

  const manager: ImportManager = ImportManager.fromSourceFile(absolutePath, sourceFileStructure);

  const typeUnion = sourceFileStructure.statements.at(-2);
  assert(typeof typeUnion === "object");
  assert(typeUnion.kind === StructureKind.TypeAlias);
  assert(typeUnion.name === "TypeStructures");

  const TypeStructuresOrNull = sourceFileStructure.statements.at(-1);
  assert(typeof TypeStructuresOrNull === "object");
  assert(TypeStructuresOrNull.kind === StructureKind.TypeAlias);
  assert(TypeStructuresOrNull.name === "TypeStructuresOrNull");

  manager.addImports({
    pathToImportedModule: pathToModule(stageDir, `source/structures/type/${className}.ts`),
    isPackageImport: false,
    isDefaultImport: false,
    importNames: [ className ],
    isTypeOnly: true,
  });

  {
    const parenthesesTypeStructure = typeUnion.typeStructure;
    assert(parenthesesTypeStructure.kind === TypeStructureKind.Parentheses);

    const unionOfTypes = parenthesesTypeStructure.childTypes[0];
    assert(unionOfTypes.kind === TypeStructureKind.Union);

    const { childTypes } = unionOfTypes;
    assert(childTypes.every(c => c.kind === TypeStructureKind.Literal));
    childTypes.push(LiteralTypeStructureImpl.get(className));
    childTypes.sort((a, b) => a.stringValue.localeCompare(b.stringValue));

    unionOfTypes.printerSettings.oneLinePerChild = true;
    unionOfTypes.printerSettings.indentChildren = true;
  }

  sourceFileStructure.statements.splice(
    0,
    sourceFileStructure.statements.length,
    ...manager.getDeclarations(),
    typeUnion, // FIXME: diff is too drastic
    TypeStructuresOrNull
  );

  sourceFile.set(sourceFileStructure);
  await sourceFile.save();
}
