import assert from "node:assert/strict";

import {
  analyze
} from "@typescript-eslint/scope-manager";

import {
  TSESTree
} from "@typescript-eslint/typescript-estree";

import {
  DefaultMap
} from "#stage_utilities/source/collections/DefaultMap.js";

import {
  AllSourcesAndClasses
} from "../createSourcesAndClasses.js";

import findClassInAST from "./findClassInAST.js";

import {
  NodeToParentMap,
  addNodesToMap
} from "./NodeToParentMap.js";

import {
  ModuleScopeMap
} from "./traceMethodReferences.js";

export default
function getDefinedClassAST(
  className: string
): TSESTree.ClassDeclarationWithName
{
  return ClassMap.getDefault(className, () => getDefinedClassASTInternal(className));
}

const ClassMap = new DefaultMap<string, TSESTree.ClassDeclarationWithName>;

function getDefinedClassASTInternal(
  className: string
): TSESTree.ClassDeclarationWithName
{
  const pathToFile = AllSourcesAndClasses.classToFile[className];
  assert(pathToFile, "require a path to file for class " + className);

  const program = AllSourcesAndClasses.programs[pathToFile];
  assert(program, "require a file at path " + pathToFile);
  if (NodeToParentMap.get(program) === undefined) {
    addNodesToMap(program);
    ModuleScopeMap.set(program, analyze(program, { sourceType: "module" }));
  }

  const tsESTree_Class = findClassInAST(program, className);
  assert(tsESTree_Class, `require class ${className} in ${AllSourcesAndClasses.classToFile[className]}`);

  return tsESTree_Class;
}
