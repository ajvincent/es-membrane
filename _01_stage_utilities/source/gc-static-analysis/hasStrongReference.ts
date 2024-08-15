//#region preamble
import assert from "node:assert/strict";

import {
  TSESTree,
} from "@typescript-eslint/typescript-estree";

import {
  Deferred,
} from "../PromiseTypes.mjs";

import getDefinedClassAST from "./ast-tools/getDefinedClassAST.js";

import organizeClassMembers, {
  type AST_ClassMembers
} from "./ast-tools/organizeClassMembers.js";

import traceMethodReferences from "./ast-tools/traceMethodReferences.js";

import type {
  ParameterLocation
} from "./types/ParameterLocation.js";

import type {
  ParameterReferenceRecursive
} from "./types/ParameterReferenceRecursive.js";
//#endregion preamble

function hashParameterLocation(
  {
    className,
    methodName,
    parameterName,
    externalReferences,
  }: ParameterLocation,
): string
{
  return JSON.stringify({
    className,
    methodName,
    parameterName,
    externalReferences,
  });
}

export default
function hasStrongParameterReference(
  parameterLocation: ParameterLocation,
): Promise<boolean>
{
  const parameterReferenceMap = new Map<string, Deferred<boolean>>;
  return hasStrongParameterReferenceInternal(parameterReferenceMap, parameterLocation);
}

async function hasStrongParameterReferenceInternal(
  parameterReferenceMap: Map<string, Deferred<boolean>>,
  parameterLocation: ParameterLocation,
): Promise<boolean>
{
  const hash: string = hashParameterLocation(parameterLocation);

  let deferred = parameterReferenceMap.get(hash);
  if (deferred) {
    /* Either we've hit a cycle, or we've answered this question already.
    Because only the first resolve call wins, this will have no impact in the second case.
    */
    deferred.resolve(false);
    return deferred.promise;
  }

  deferred = new Deferred<boolean>;
  parameterReferenceMap.set(hash, deferred);

  const {
    className,
    methodName,
    parameterName,
    externalReferences,
  } = parameterLocation;

  const tsESTree_Class = getDefinedClassAST(className);
  const members: AST_ClassMembers = await organizeClassMembers(tsESTree_Class);
  const method = members.MethodDefinitions.get(methodName);
  assert(method, "no method " + methodName);

  let isStrongReference: boolean | undefined;
  for (const dec of method.decorators) {
    let gcDecoratorResult: string | GCDecoratorResult = getGCDecoratorArguments(dec, parameterName);

    if (typeof gcDecoratorResult === "string") {
      if (externalReferences.includes(gcDecoratorResult)) {
        isStrongReference = true;
      }

      else {
        isStrongReference = await hasStrongParameterReferenceInternal(
          parameterReferenceMap, {
            ...parameterLocation,
            parameterName: gcDecoratorResult
          }
        );
      }
    }
    else {
      switch (gcDecoratorResult) {
        case GCDecoratorResult.NotAGCDecorator:
        case GCDecoratorResult.NoEffect:
          continue;
        case GCDecoratorResult.HoldsStrong:
          isStrongReference = true;
          break;
        case GCDecoratorResult.HoldsWeak:
        case GCDecoratorResult.Clears:
            isStrongReference = false;
          break;
      }
    }
  }

  if (typeof isStrongReference === "boolean") {
    deferred.resolve(isStrongReference);
    return deferred.promise;
  }

  /*

  if (method) {
    traceMethodReferences(
      method,
      parameterReferenceMap,
      hasStrongParameterReferenceInternal,
      parameterLocation
    ).then(deferred.resolve).catch(deferred.reject);
    return deferred.promise;
  }

  if (tsESTree_Class.superClass) {
    const baseClassName: string = (tsESTree_Class.superClass as TSESTree.Identifier).name;

    hasStrongParameterReferenceInternal(
      parameterReferenceMap,
      {
        ...parameterLocation,
        className: baseClassName,
      },
    )
    .then(deferred.resolve)
    .catch((): void => {
      deferred.reject(new Error(`superclass call failed for ${baseClassName}::${methodName}`));
    });

    return deferred.promise;
  }
  */

  deferred.reject(new Error(`no method found for ${className}::${methodName}`));
  return deferred.promise;
}
hasStrongParameterReferenceInternal satisfies ParameterReferenceRecursive;

enum GCDecoratorResult {
  NotAGCDecorator,
  NoEffect,
  HoldsStrong,
  HoldsWeak,
  Clears,
}

function getGCDecoratorArguments(
  dec: TSESTree.Decorator,
  paramName: string
): string | GCDecoratorResult
{
  switch (dec.expression.type) {
    case "Identifier":
      if (dec.expression.name === "noReferences")
        return GCDecoratorResult.NoEffect;
      if (dec.expression.name === "clearsAllReferences")
        return GCDecoratorResult.Clears;
      break;

    case "CallExpression":
      assert.equal(dec.expression.callee.type, "Identifier", "expected an identifier for a decorator call expression");
      if (dec.expression.callee.name === "clearsReference") {
        assert.equal(dec.expression.arguments.length, 1);
        assert.equal(dec.expression.arguments[0].type, "Literal");
        assert(typeof dec.expression.arguments[0].value === "string");

        return paramName === dec.expression.arguments[0].value ? GCDecoratorResult.Clears : GCDecoratorResult.NoEffect;
      }

      if (dec.expression.callee.name === "holdsReference") {
        assert.equal(dec.expression.arguments.length, 3);
        assert.equal(dec.expression.arguments[0].type, "Literal");
        assert.equal(dec.expression.arguments[1].type, "Literal");
        assert.equal(dec.expression.arguments[2].type, "Literal");
        assert(typeof dec.expression.arguments[0].value === "string");
        assert(typeof dec.expression.arguments[1].value === "string");
        assert(typeof dec.expression.arguments[2].value === "boolean");

        if (dec.expression.arguments[1].value !== paramName)
          return GCDecoratorResult.NoEffect;

        if (dec.expression.arguments[2].value === false)
          return GCDecoratorResult.HoldsWeak;

        if (dec.expression.arguments[0].value === "this")
          return GCDecoratorResult.HoldsStrong;

        return dec.expression.arguments[0].value;
      }

      if (dec.expression.callee.name === "ctorHoldsReference") {
        assert.equal(dec.expression.arguments.length, 2);
        assert.equal(dec.expression.arguments[0].type, "Literal");
        assert.equal(dec.expression.arguments[1].type, "Literal");
        assert(typeof dec.expression.arguments[0].value === "string");
        assert(typeof dec.expression.arguments[1].value === "boolean");

        if (dec.expression.arguments[0].value !== paramName) {
          return GCDecoratorResult.NoEffect;
        }

        if (dec.expression.arguments[1].value)
          return GCDecoratorResult.HoldsStrong;

        return GCDecoratorResult.HoldsWeak;
      }
      break;
  }

  return GCDecoratorResult.NotAGCDecorator;
}
