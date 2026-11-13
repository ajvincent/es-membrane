import {
  StructureKind
} from "ts-morph";
import type {
  ClassDeclarationStructure,
  ExportDeclarationStructure,
  ImportSpecifierStructure,
  MethodSignatureStructure,
  NameableNodeStructure,
  NamedNodeStructure,
  Node,
  OptionalKind,
  PropertySignatureStructure,
  StatementStructures,
  SourceFile,
  SourceFileStructure,
  VariableDeclarationStructure,
  VariableStatementStructure,
} from "ts-morph";

import { runPrettify } from "@ajvincent/build-utilities";

import { pathToModule } from "#utilities/source/AsyncSpecModules.js";
import getTS_SourceFile from "#utilities/source/getTS_SourceFile.js";

import {
  type AugmentedStructures,
  type MemberedObjectTypeStructureImpl,
  type NodeToStructureConsole,
  QualifiedNameTypeStructureImpl,
  TypeStructureKind,
  forEachAugmentedStructureChild,
  getAugmentedStructure,
} from "#stage_two/snapshot/source/exports.js";

import {
  stageDir
} from "../pre-build/constants.js";

import {
  sortMemberNames
} from "../../stage_3_generation/moduleClasses/sortClassMembers.js";

//#region driver
export async function fixExportTypes(): Promise<void>
{
  const sourceFile: SourceFile = getTS_SourceFile(stageDir, "snapshot/dist/exports.d.ts");
  function parseConsole(
    message: string,
    failingNode: Node,
  ): void
  {
    void(message);
    void(failingNode);
  }
  parseConsole satisfies NodeToStructureConsole;

  const { rootStructure } = getAugmentedStructure(sourceFile, parseConsole, true, StructureKind.SourceFile);

  // mixin-decorators injects a ts-morph import for scope... we already import it elsewhere
  const ts_morph_index = rootStructure.statements.findIndex(s => {
    if (typeof s !== "object")
      return false;
    if (s.kind !== StructureKind.ImportDeclaration)
      return false;
    if (s.namespaceImport !== "ts_morph")
      return false;

    return true;
  });
  if (ts_morph_index !== -1)
    rootStructure.statements.splice(ts_morph_index, 1);

  forEachAugmentedStructureChild(rootStructure, recurseStructures);
  StatementSorter.sortRoot(rootStructure);

  sourceFile.set(rootStructure);
  await sourceFile.save();

  await runPrettify(pathToModule(stageDir, "snapshot/dist"));
}

function recurseStructures(child: AugmentedStructures): void {
  switch (child.kind) {
    case TypeStructureKind.MemberedObject:
      sortMemberedObjectType(child);
      forEachAugmentedStructureChild(child, recurseStructures);
      break;

    case StructureKind.ImportDeclaration:
      (child.namedImports as ImportSpecifierStructure[]).sort(nameSorter);
      break;

    case TypeStructureKind.QualifiedName:
      fixTS_MorphPrefix(child);
      forEachAugmentedStructureChild(child, recurseStructures);
      break;

    default:
      forEachAugmentedStructureChild(child, recurseStructures);
      break;
  }
}
//#endregion driver

//#region MemberedObjectTypeStructureImpl
function sortMemberedObjectType(
  memberedObject: MemberedObjectTypeStructureImpl,
): void
{
  memberedObject.properties?.sort(sortMembers);
  memberedObject.methods?.sort(sortMembers);
}
//#endregion MemberedObjectTypeStructureImpl

// mixin-decorators injects a ts-morph import for scope... we already import it elsewhere
function fixTS_MorphPrefix(
  qName: QualifiedNameTypeStructureImpl
): void
{
  if (qName.childTypes[0] === "ts_morph") {
    qName.childTypes.shift();
  }
}

//#region source file statements
interface RawStatementGroups {
  StructureImpl: (ClassDeclarationStructure & NamedNodeStructure)[];
  TypeStructureImpl: (ClassDeclarationStructure & NamedNodeStructure)[];
  StatementStructureImpl: (ClassDeclarationStructure & NamedNodeStructure)[];
  ExpressionStructureImpl: (ClassDeclarationStructure & NamedNodeStructure)[];
  StructureMixin: VariableStatementStructure[];
  Exports: ExportDeclarationStructure[];
  other: StatementStructures[];
}

interface StatementGroups {
  Structures: (VariableStatementStructure | ClassDeclarationStructure)[];
  TypeStructures: (ClassDeclarationStructure & NamedNodeStructure)[];
  StatementStructures: (ClassDeclarationStructure & NamedNodeStructure)[];
  ExpressionStructures: (ClassDeclarationStructure & NamedNodeStructure)[];
  Exports: ExportDeclarationStructure[];
  other: StatementStructures[];
}

class StatementSorter {
  static readonly #statementKindOrdering: ReadonlyMap<StructureKind, number> = new Map([
    [StructureKind.ImportDeclaration, 0],
    [StructureKind.Enum, 1],
    [StructureKind.Interface, 3],
    [StructureKind.TypeAlias, 2],
    [StructureKind.VariableStatement, 4],
    [StructureKind.Function, 5],
    [StructureKind.Class, 6],
  ]);

  public static sortRoot(rootStructure: SourceFileStructure): void {
    const statements = rootStructure.statements as StatementStructures[];
    const sorter = new StatementSorter(statements);
    rootStructure.statements = sorter.getSortedStatements();
  }

  static #statementGrouper(
    this: void,
    statement: StatementStructures
  ): "StructureImpl" | "TypeStructureImpl" | "StatementStructureImpl" | "ExpressionStructureImpl" | "StructureMixin" | "Exports" | "other"
  {
    if (statement.kind === StructureKind.Class && statement.name) {
      if (statement.name.endsWith("TypeStructureImpl"))
        return "TypeStructureImpl";
      if (statement.name !== "VariableStatementImpl" && statement.name.endsWith("StatementImpl"))
        return "StatementStructureImpl";
      if (statement.name.endsWith("ExpressionImpl"))
        return "ExpressionStructureImpl";
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
      StatementStructures: rawStatementGroups.StatementStructureImpl,
      ExpressionStructures: rawStatementGroups.ExpressionStructureImpl || [],
      Exports: rawStatementGroups.Exports,
      other: rawStatementGroups.other,
    };
    statementGroups.TypeStructures.sort(nameSorter);
    statementGroups.StatementStructures.sort(nameSorter);
    statementGroups.ExpressionStructures.sort(nameSorter);

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

  private constructor(statements: StatementStructures[]) {
    this.#statements = statements;
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
      "//#region statement structure classes\n",
      groups.StatementStructures,
      "//#endregion statement structure classes\n",
      "//#region expression structure classes\n",
      groups.ExpressionStructures,
      "//#endregion expression structure classes\n",
      groups.Exports
    ].flat();
  }

  #statementComparator(
    a: StatementStructures,
    b: StatementStructures,
  ): number
  {
    const aOrder = StatementSorter.#statementKindOrdering.get(a.kind);
    if (aOrder === undefined)
      throw new Error("unknown kind: " + JSON.stringify(a));
    const bOrder = StatementSorter.#statementKindOrdering.get(b.kind);
      if (bOrder === undefined)
        throw new Error("unknown kind: " + JSON.stringify(b));

    if (a.kind !== b.kind) {
      return aOrder - bOrder;
    }

    if (a.kind === StructureKind.VariableStatement && b.kind === StructureKind.VariableStatement) {
      return nameSorter(a.declarations[0], b.declarations[0]);
    }

    if (a.kind === StructureKind.ImportDeclaration && b.kind === StructureKind.ImportDeclaration) {
      const rv = a.moduleSpecifier.localeCompare(b.moduleSpecifier);
      if (rv !== 0)
        return rv;
      if (!a.isTypeOnly && b.isTypeOnly) {
        return -1;
      }
      if (!b.isTypeOnly && a.isTypeOnly) {
        return +1;
      }
    }

    if (("name" in a) && ("name" in b) && a.name !== undefined && b.name !== undefined) {
      return nameSorter(a, b);
    }

    throw new Error("how'd we get here?  " + JSON.stringify({a, b}, null, 2));
  }
}
//#endregion source file statements

function sortMembers(
  a: Readonly<OptionalKind<MethodSignatureStructure> | OptionalKind<PropertySignatureStructure>>,
  b: Readonly<OptionalKind<MethodSignatureStructure> | OptionalKind<PropertySignatureStructure>>
): number
{
  return sortMemberNames(a.name, b.name);
}

function nameSorter(a: NameableNodeStructure, b: NameableNodeStructure): number {
  return sortMemberNames(a.name!, b.name!);
}
