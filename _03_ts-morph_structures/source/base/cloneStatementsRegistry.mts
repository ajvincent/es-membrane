/**
 * We've got a circular dependency landmine here.  Nothing explicitly imports this registry file,
 * which means there's no guarantee this registry will happen.  If we import this from one of the
 * classes below, then we have our circular dependency and Bad Things happen.
 *
 * So far, I've been "lucky", as test code seems to be importing it for me.  I really need to not
 * depend on luck.
 */

import {
  StructureKind
} from "ts-morph";

// StatementStructures
import ClassDeclarationImpl from "./ClassDeclarationImpl.mjs";
import ImportDeclarationImpl from "./ImportDeclarationImpl.mjs";
import InterfaceDeclarationImpl from "./InterfaceDeclarationImpl.mjs";
import TypeAliasDeclarationImpl from "./TypeAliasDeclarationImpl.mjs";

import cloneableStatementsMap from "./cloneableStatements.mjs";

cloneableStatementsMap.set(StructureKind.Class, ClassDeclarationImpl);
cloneableStatementsMap.set(StructureKind.ImportDeclaration, ImportDeclarationImpl);
cloneableStatementsMap.set(StructureKind.Interface, InterfaceDeclarationImpl);
cloneableStatementsMap.set(StructureKind.TypeAlias, TypeAliasDeclarationImpl);

export default cloneableStatementsMap;
