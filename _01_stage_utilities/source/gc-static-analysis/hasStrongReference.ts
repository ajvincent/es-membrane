//#region preamble
import {
  TSESTree,
} from "@typescript-eslint/typescript-estree";

import type {
  ReadonlyDeep,
} from "type-fest";

import {
  Deferred,
  SingletonPromise,
} from "../PromiseTypes.mjs";

import type {
  SourceClassReferences,
} from "./JSONClasses/SourceClass.js";

import organizeClassMembers, {
  type AST_ClassMembers
} from "./ast-tools/organizeClassMembers.js";

import traceMethodReferences from "./ast-tools/traceMethodReferences.js";

import getBuiltinClassReferences, {
  hasStrongParameterReference_builtin
} from "./builtin-classes.js";

import type {
  ParameterLocation
} from "./types/ParameterLocation.js";

import type {
  ParameterReferenceRecursive
} from "./types/ParameterReferenceRecursive.js";
import getDefinedClassAST from "./ast-tools/getDefinedClassAST.js";
//#endregion preamble

const BuiltInReferencesMapPromise = new SingletonPromise(
  () => getBuiltinClassReferences(false)
);

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

  const BuiltInReferencesMap = await BuiltInReferencesMapPromise.run();
  const {
    className,
    methodName,
  } = parameterLocation;

  if (className in BuiltInReferencesMap) {
    const classData: ReadonlyDeep<SourceClassReferences> = BuiltInReferencesMap[className];

    hasStrongParameterReference_builtin(
      classData,
      parameterReferenceMap,
      hasStrongParameterReferenceInternal,
      parameterLocation
    ).then(deferred.resolve).catch(deferred.reject);

    return deferred.promise;
  }

  const tsESTree_Class = getDefinedClassAST(className);
  const members: AST_ClassMembers = organizeClassMembers(tsESTree_Class);
  const method = members.MethodDefinitions.get(methodName);

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

  deferred.reject(new Error(`no method found for ${className}::${methodName}`));
  return deferred.promise;
}
hasStrongParameterReferenceInternal satisfies ParameterReferenceRecursive;
