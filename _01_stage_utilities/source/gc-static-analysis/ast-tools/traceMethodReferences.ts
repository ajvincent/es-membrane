//#region preamble
import assert from "node:assert";

import {
  Deferred,
  SingletonPromise,
} from "#build-utilities/internal/PromiseTypes.js";

import type {
  TSESTree,
} from "@typescript-eslint/typescript-estree";

import type {
  Scope,
  ScopeManager,
  Variable,
} from "@typescript-eslint/scope-manager";

import getBuiltinClassReferences from "../builtin-classes.js";

import {
  ParameterLocation,
} from "../types/ParameterLocation.js";

import {
  ParameterReferenceRecursive,
} from "../types/ParameterReferenceRecursive.js";

import {
  NodeToParentMap,
  NodeToProgramMap,
} from "./NodeToParentMap.js";

import getDefinedClassAST from "./getDefinedClassAST.js";

import organizeClassMembers from "./organizeClassMembers.js";

//#endregion preamble

const BuiltInReferencesMapPromise = new SingletonPromise(
  () => getBuiltinClassReferences(false)
);

export const ModuleScopeMap = new WeakMap<TSESTree.Program, ScopeManager>;

export default
async function traceMethodReferences(
  tsESTree_Method: TSESTree.MethodDefinition,
  parameterReferenceMap: Map<string, Deferred<boolean>>,
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
        const result = await traceCallReference(identifier, parent, parameterReferenceMap, referenceRecursive, parameterLocation);
        if (result)
          return true;
      default:
        throw new Error(`type ${parent.type} not yet supported`);
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

  const {
    className,
    externalReferences
  } = parameterLocation;

  if (callExpression.callee.type === "MemberExpression") {
    if ((callExpression.callee.object.type === "ThisExpression") && (callExpression.callee.property.type === "Identifier")) {
      // yay, we can map to an existing method on this

      /* But this introduces more complexity.
      - what class is the method defined on?
      - map the identifier to an existing argument
      - map external references to existing arguments
      ... _then_ we can call referenceRecursive

      At this point we're converging on "emulate what the engine does", because _other_ arguments
      on the target might be locally synthetic, holding references.
      */

      //TODO: make this a generic function
      let nextMethodName: string = callExpression.callee.property.name;
      const builtIns = await BuiltInReferencesMapPromise.run();
      const builtinClass = builtIns[className];
      if (builtinClass) {

      } else {
        throw new Error("not yet supported: calling a defined class's method (mapping)");
        /*
        let nextClass: TSESTree.ClassDeclarationWithName = getDefinedClassAST(className);
        let nextMethod: TSESTree.MethodDefinition | undefined = organizeClassMembers(nextClass).MethodDefinitions.get(nextMethodName);
        assert(nextMethod, "deal with superclass calls");
        */
      }



    }
  }
  debugger;
  throw new Error("unsupported call expression type: " + callExpression.callee.type);
}

