//#region preamble
import assert from "node:assert";

import type {
  TSESTree,
} from "@typescript-eslint/typescript-estree";

import {
  Deferred,
  PromiseAllParallel
} from "#stage_utilities/source/PromiseTypes.js";

import type {
  Scope,
  ScopeManager,
  Variable,
} from "@typescript-eslint/scope-manager";

import {
  ParameterLocation,
} from "../types/ParameterLocation.js";

import {
  ParameterReferenceRecursive,
} from "../types/ParameterReferenceRecursive.js";

import ASTNodeError from "./ASTNodeError.js";

import {
  NodeToParentMap,
  NodeToProgramMap,
} from "./NodeToParentMap.js";

import getDefinedClassAST from "./getDefinedClassAST.js";

import organizeClassMembers, {
  AST_ClassMembers,
} from "./organizeClassMembers.js";

//#endregion preamble

export const ModuleScopeMap = new WeakMap<TSESTree.Program, ScopeManager>;

export default
async function traceMethodReferences(
  tsESTree_Method: TSESTree.MethodDefinition,
  parameterReferenceMap: Map<string, Deferred<boolean>>,
  thisClassName: string,
  referenceRecursive: ParameterReferenceRecursive,
  parameterLocation: ParameterLocation,
): Promise<boolean>
{
  const methodScope: Scope | null = getScopeForNode(tsESTree_Method.value);
  assert(methodScope, "we must have a scope for " + tsESTree_Method.value.id);

  const {
    methodName,
    parameterName,
    externalReferences,
  } = parameterLocation;

  const paramAsVariable: Variable | undefined = methodScope.variables.find(v => v.name === parameterName);
  assert(paramAsVariable, `must have parameter variable ${parameterName} for method ${methodName}`);

  const matchingIdentifiers: TSESTree.Identifier[] = paramAsVariable.references.filter(
    ref => ref.isRead()
  ).map(
    ref => ref.identifier as TSESTree.Identifier
  );

  for (const identifier of matchingIdentifiers) {
    const parent = NodeToParentMap.get(identifier)!;
    switch (parent.type) {
      case "CallExpression":
        const result: boolean = await traceCallReference(
          identifier, parent, parameterReferenceMap, thisClassName, referenceRecursive, parameterLocation
        );
        if (result)
          return true;
        break;

      case "UnaryExpression":
        switch (parent.operator) {
          case "void":
            return false;
          default:
            throw new ASTNodeError(`unsupported unary operator: ${parent.operator}`, identifier);
        }

      default:
        throw new ASTNodeError(`unsupported parent expression type: ${parent.type}`, identifier);
    }
  }

  return false;
}

function getScopeForNode(
  node: TSESTree.Node
): Scope | null
{
  const program: TSESTree.Program | undefined = NodeToProgramMap.get(node);
  if (!program)
    return null;
  const scopeManager: ScopeManager | undefined = ModuleScopeMap.get(program);
  if (!scopeManager)
    return null;
  return scopeManager.acquire(node);
}

async function traceCallReference(
  identifier: TSESTree.Identifier,
  callExpression: TSESTree.CallExpression,
  parameterReferenceMap: Map<string, Deferred<boolean>>,
  thisClassName: string,
  referenceRecursive: ParameterReferenceRecursive,
  parameterLocation: ParameterLocation,
): Promise<boolean>
{
  if (identifier === callExpression.callee) {
    // foo() is not a strong hold
    return false;
  }

  let argIndex = callExpression.arguments.indexOf(identifier);
  assert(argIndex >= 0, `argument "${identifier.name} must be in the call expression"`);

  if (callExpression.callee.type === "MemberExpression") {
    if ((callExpression.callee.object.type === "ThisExpression") && (callExpression.callee.property.type === "Identifier")) {
      // yay, we can map to an existing method on this

      /* But this introduces more complexity.
      - map the identifier to existing arguments
      - map external references to existing arguments
      ... _then_ we can call referenceRecursive

      At this point we're converging on "emulate what the engine does", because _other_ arguments
      on the target might be locally synthetic, holding references.
      */

      //TODO: make this a generic function
      const nextMethodName: string = callExpression.callee.property.name;

      let targetMethod: TSESTree.MethodDefinition | undefined;
      let targetClassName: string = thisClassName;
      do {
        let nextClass: TSESTree.ClassDeclarationWithName = getDefinedClassAST(targetClassName);
        const nextClassMembers: AST_ClassMembers = await organizeClassMembers(nextClass);
        targetMethod = nextClassMembers.MethodDefinitions.get(nextMethodName);
        if (!targetMethod) {
          assert(nextClassMembers.superClass);
          targetClassName = nextClassMembers.superClass;
        }
      } while (!targetMethod);

      const mappedExternalsArray: string[] = mapCallArgumentsToMethodArguments(
        callExpression,
        targetMethod,
        new Set(parameterLocation.externalReferences)
      );
      const mappedParameterSpots: string[] = mapCallArgumentsToMethodArguments(
        callExpression,
        targetMethod,
        new Set([parameterLocation.parameterName])
      );

      const promiseSeries: boolean[] = await PromiseAllParallel<string, boolean>(
        mappedParameterSpots, (parameterName => {
          return referenceRecursive(parameterReferenceMap, thisClassName, {
            className: thisClassName,
            methodName: nextMethodName,
            parameterName,
            externalReferences: mappedExternalsArray
          });
        })
      );

      return promiseSeries.some(result => result);
    }
  }
  throw new ASTNodeError(`unsupported call expression type: ${callExpression.callee.type}`, callExpression);
}

function mapCallArgumentsToMethodArguments(
  callExpression: TSESTree.CallExpression,
  method: TSESTree.MethodDefinition,
  parameterNames: Set<string>
): string[]
{
  if (parameterNames.size === 0)
    return [];

  const argumentMap: Map<number, string> = new Map(method.value.params.map((param, index) => {
    assert(param.type === "Identifier");
    return [index, param.name];
  }));
  const foundIndexes = new Set<number>;

  callExpression.arguments.forEach((callParam, callIndex) => {
    assert(callParam.type === "Identifier");
    if (parameterNames.has(callParam.name))
      foundIndexes.add(callIndex);
  });

  const argumentIndices: number[] = Array.from(foundIndexes);
  argumentIndices.sort();

  const methodParams: string[] = [];
  for (const argIndex of argumentIndices)
    methodParams.push(argumentMap.get(argIndex)!);
  return methodParams;
}
