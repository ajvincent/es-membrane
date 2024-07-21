import fs from "fs/promises";
import path from "path";

import {
  parseAndGenerateServices,
  TSESTree,
} from '@typescript-eslint/typescript-estree';

import {
  analyze,
  Scope,
  ScopeManager,
  Variable
} from '@typescript-eslint/scope-manager';

import {
  projectDir
} from "../AsyncSpecModules.mjs";

import findClassInAST from "./findClassInAST.js";
import organizeClassMembers, {
  type AST_ClassMembers
} from "./organizeClassMembers.js";

interface StrongReference {
  pathsToObjects: readonly string[];
}

export default
async function holdsArgument(
  pathToTypeScriptFile: string,
  className: string,
  methodName: string,
  paramName: string,
): Promise<readonly StrongReference[]>
{
  pathToTypeScriptFile = path.resolve(projectDir, pathToTypeScriptFile);
  const tsSource = await fs.readFile(pathToTypeScriptFile, { encoding: "utf-8" });

  const {
    ast,
    services
  } = parseAndGenerateServices(tsSource, { loc: true, range: true });

  const classAST: TSESTree.ClassDeclaration | undefined = findClassInAST(ast, className);
  if (classAST === undefined) {
    throw new Error(`class ${className} not found`);
  }

  const members: AST_ClassMembers = organizeClassMembers(classAST);
  const method = members.MethodDefinitions.get(methodName);
  if (!method)
    throw new Error(`class ${className} has no method ${methodName}`);

  const param = method.value.params.find(
    (p: TSESTree.Parameter) => {
      if (p.type === "Identifier") {
        return (p as TSESTree.Identifier).name === paramName;
      }

      return false;
    }
  );
  if (!param)
    throw new Error(`method ${methodName} has no parameter ${paramName}`);

  const moduleScope: ScopeManager = analyze(ast, {
    sourceType: "module"
  });
  const methodScope: Scope | null = moduleScope.acquire(method.value);
  if (!methodScope)
    throw new Error("how did we not have a scope?");

  debugger;
  const paramAsVariable = methodScope.variables.find(v => v.name === (param as TSESTree.Identifier).name);
  if (!paramAsVariable) {
    throw new Error("how did we not have the variable in the scope?");
  }

  // We now need to begin tracing variable.references.

  throw new Error("not yet implemented");
}

/*
await holdsArgument(
  "_01_stage_utilities/source/collections/DefaultMap.ts",
  "DefaultMap",
  "getDefault",
  "key"
);
*/

await holdsArgument(
  "_03_objectgraph_handlers/source/RevokerManagement.ts",
  "RevokerManagement",
  "addRevoker",
  "owner"
);
