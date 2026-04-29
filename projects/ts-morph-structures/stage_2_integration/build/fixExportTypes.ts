//#region preamble
import assert from "node:assert/strict";

import {
  StructureKind
} from "ts-morph";
import type {
  SourceFile,
  SourceFileStructure,
  ExportDeclarationStructure,
  ImportSpecifierStructure,
  MethodSignatureStructure,
  OptionalKind,
  PropertySignatureStructure,
  TypeNode,
  StatementStructures,
  ClassDeclarationStructure,
  VariableDeclarationStructure,
  NameableNodeStructure,
  VariableStatementStructure,
  NamedNodeStructure,
} from "ts-morph";

import { runPrettify } from "@ajvincent/build-utilities";

import { pathToModule } from "#utilities/source/AsyncSpecModules.js";
import getTS_SourceFile from "#utilities/source/getTS_SourceFile.js";

import {
  forEachAugmentedStructureChild,
  getTypeAugmentedStructure,
  type StructureImpls,
  type TypeStructures,
  TypeStructureKind,
  type MemberedObjectTypedStructure,
  type SourceFileImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import {
  stageDir
} from "../pre-build/constants.js";
//#endregion preamble

//#region driver
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
  StatementSorter.sortRoot(rootStructure);

  sourceFile.set(rootStructure);
  await sourceFile.save();

  await runPrettify(pathToModule(stageDir, "snapshot/dist"));
}

function recurseStructures(child: StructureImpls | TypeStructures): void {
  switch (child.kind) {
    case TypeStructureKind.MemberedObject:
      sortMemberedObjectType(child);
      break;

    case StructureKind.ImportDeclaration:
      (child.namedImports as ImportSpecifierStructure[]).sort(nameSorter);
      break;

    default:
      forEachAugmentedStructureChild(child, recurseStructures);
      break;
  }
}
//#endregion driver

//#region MemberedObjectTypedStructure
function sortMemberedObjectType(
  memberedObject: MemberedObjectTypedStructure,
): void
{
  memberedObject.properties?.sort(sortMembers);
  memberedObject.methods?.sort(sortMembers);
}
//#endregion MemberedObjectTypedStructure

//#region source file statements
interface RawStatementGroups {
  StructureImpl: (ClassDeclarationStructure & NamedNodeStructure)[];
  TypeStructureImpl: (ClassDeclarationStructure & NamedNodeStructure)[];
  StructureMixin: VariableStatementStructure[];
  Exports: ExportDeclarationStructure[];
  other: StatementStructures[];
}

interface StatementGroups {
  Structures: (VariableStatementStructure | ClassDeclarationStructure)[];
  TypeStructures: (ClassDeclarationStructure & NamedNodeStructure)[];
  Exports: ExportDeclarationStructure[];
  other: StatementStructures[];
}

class StatementSorter {
  public static sortRoot(rootStructure: SourceFileStructure): void {
    const statements = rootStructure.statements as StatementStructures[];
    const sorter = new StatementSorter(statements);
    rootStructure.statements = sorter.getSortedStatements();
  }

  static #elementWithPosition<T>(this: void, element: T, index: number): [T, number]
  {
    return [element, index];
  }

  static #statementGrouper(
    this: void,
    statement: StatementStructures
  ): "StructureImpl" | "TypeStructureImpl" | "StructureMixin" | "Exports" | "other"
  {
    if (statement.kind === StructureKind.Class && statement.name) {
      if (statement.name.endsWith("TypeStructureImpl"))
        return "TypeStructureImpl";
      if (statement.name.endsWith("Impl"))
        return "StructureImpl";
    }

    else if (statement.kind === StructureKind.VariableStatement && statement.declarations.length === 1) {
      const decl = statement.declarations[0] as VariableDeclarationStructure;
      if (decl && decl.name.endsWith("StructureBase")) {
        return "StructureMixin";
      }
    }

    else if (statement.kind === StructureKind.ExportDeclaration)
      return "Exports";

    return "other";
  }

  static #getVariableStatementsMap(
    statements: readonly VariableStatementStructure[]
  ): ReadonlyMap<string, VariableStatementStructure>
  {
    return new Map(statements.map(s => [s.declarations[0].name, s]));
  }

  static #groupStatements(
    statements: readonly StatementStructures[]
  ): StatementGroups
  {
    const rawStatementGroups = Object.groupBy(
      statements, StatementSorter.#statementGrouper
    ) as RawStatementGroups;

    const statementGroups: StatementGroups = {
      Structures: [],
      TypeStructures: rawStatementGroups.TypeStructureImpl,
      Exports: rawStatementGroups.Exports,
      other: rawStatementGroups.other,
    };
    statementGroups.TypeStructures.sort(nameSorter);

    const constantsMap: ReadonlyMap<string, VariableStatementStructure> = this.#getVariableStatementsMap(
      rawStatementGroups.StructureMixin
    );
    rawStatementGroups.StructureImpl.sort(nameSorter);
    for (const structureClass of rawStatementGroups.StructureImpl) {
      const extendsName = structureClass.extends as string;
      const constStatement = constantsMap.get(extendsName);
      if (constStatement)
        statementGroups.Structures.push(constStatement);
      statementGroups.Structures.push(structureClass);
    }

    return statementGroups;
  }

  readonly #statements: StatementStructures[];
  readonly #positionMap: Pick<WeakMap<StatementStructures, number>, "get">;

  private constructor(statements: StatementStructures[]) {
    this.#statements = statements;
    this.#positionMap = new WeakMap(statements.map(StatementSorter.#elementWithPosition));
  }

  getSortedStatements(): (StatementStructures | string)[] {
    const groups = StatementSorter.#groupStatements(this.#statements);
    groups.other.sort(this.#statementComparator.bind(this));

    return [
      groups.other,
      "//#region structure classes\n",
      groups.Structures,
      "//#endregion structure classes\n",
      "//#region type structure classes\n",
      groups.TypeStructures,
      "//#endregion type structure classes\n",
      groups.Exports
    ].flat();
  }

  #statementComparator(
    a: StatementStructures,
    b: StatementStructures,
  ): number
  {
    return this.#positionMap.get(a)! - this.#positionMap.get(b)!;
  }
}
//#endregion source file statements

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

function nameSorter(a: NameableNodeStructure, b: NameableNodeStructure): number {
  return a.name!.localeCompare(b.name!);
}
