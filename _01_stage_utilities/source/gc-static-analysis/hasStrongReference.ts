//#region preamble
import assert from "node:assert";

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

import {
  DefaultMap
} from "../collections/DefaultMap.js";

import {
  HOLD_TYPE,
  IdentifierOwners,
} from "./JSONClasses/IdentifierOwners.js";

import {
  SourceClassMethod,
  SourceClassReferences,
} from "./JSONClasses/SourceClass.js";

import findClassInAST from "./ast-tools/findClassInAST.js";

import organizeClassMembers, {
  type AST_ClassMembers
} from "./ast-tools/organizeClassMembers.js";

import getBuiltinClassReferences from "./builtin-classes.js";

import {
  AllSourcesAndClasses
} from "./createSourcesAndClasses.js";
//#endregion preamble

export interface ParameterLocation {
  className: string;
  methodName: string;
  parameterName: string;
  externalReferences: string[];
}

export default
function hasStrongParameterReference(
  parameterLocation: ParameterLocation,
): Promise<boolean>
{
  const parameterReferenceMap = new Map<string, Deferred<boolean>>;
  return hasStrongParameterReferenceInternal(parameterReferenceMap, parameterLocation);
}

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

const BuiltInReferencesMapPromise = new SingletonPromise(
  () => getBuiltinClassReferences(false)
);

const ClassMap = new DefaultMap<string, TSESTree.ClassDeclarationWithName>;

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
      classData, parameterReferenceMap, parameterLocation
    ).then(deferred.resolve);

    return deferred.promise;
  }

  const tsESTree_Class = ClassMap.getDefault(className, () => getDefinedClassAST(className));
  const members: AST_ClassMembers = organizeClassMembers(tsESTree_Class);
  const method = members.MethodDefinitions.get(methodName);

  if (method) {
    deferred.reject(new Error("not yet implemented"));
  }
  else if (tsESTree_Class.superClass) {
    const baseClassName: string = (tsESTree_Class.superClass as TSESTree.Identifier).name;
    try {
      const result = await hasStrongParameterReferenceInternal(
        parameterReferenceMap,
        {
          ...parameterLocation,
          className: baseClassName,
        },
      );

      deferred.resolve(result);
    }
    catch (ex) {
      deferred.reject(new Error(`superclass call failed for ${baseClassName}::${methodName}`));
    }
  } else {
    deferred.reject(new Error(`no method found for ${className}::${methodName}`));
  }
  return deferred.promise;
}

async function hasStrongParameterReference_builtin(
  sourceClass: ReadonlyDeep<SourceClassReferences>,
  parameterReferenceMap: Map<string, Deferred<boolean>>,
  {
    className,
    methodName,
    parameterName,
    externalReferences,
  }: ParameterLocation,
): Promise<boolean>
{
  const method: ReadonlyDeep<SourceClassMethod> | undefined = sourceClass.methods[methodName];
  if (!method) {
    throw new Error(`method "${methodName}" not found in source class ${className}`);
  }

  const parameter: ReadonlyDeep<IdentifierOwners> | undefined = method.variables[parameterName];
  if (!parameter)
    throw new Error(`${className}::${method} has no parameter "${parameterName}"`);

  let foundStrong = false;

  const indeterminates: Error[] = [];
  for (const reference of parameter.references) {
    if (reference.identifierSequence.length === 1 && externalReferences.includes(reference.identifierSequence[0])) {
      foundStrong = true;
      continue;
    }

    if (reference.holdType === HOLD_TYPE.Weak)
      continue;
    if (reference.holdType === HOLD_TYPE.Indeterminate) {
      indeterminates.push(new Error(
        `indeterminate reference: ${reference.identifierSequence.join("::")}@${
          reference.statementLocation?.start.line
        }`
      ));
      continue;
    }

    if (reference.identifierSequence.length > 1) {
      indeterminates.push(new Error(
        `unsupported identifier sequence: ${reference.identifierSequence.join("::")}@${
          reference.statementLocation?.start.line
        }`
      ));
      continue;
    }

    assert.notEqual(reference.identifierSequence.length, 0, "we need some identifier to look up");
    const otherIdentifier = reference.identifierSequence[0];
    if (otherIdentifier === "this")
      foundStrong = true;

    else if (otherIdentifier in method.variables) {
      foundStrong ||= await hasStrongParameterReferenceInternal(
        parameterReferenceMap,
        {
          className,
          methodName,
          parameterName: otherIdentifier,
          externalReferences
        },
      );
    }
  }

  if (indeterminates.length) {
    throw new AggregateError(
      indeterminates,
      `${className}::${method}(${parameterName}), unable to determine if reference is strong or weak`
    );
  }

  return foundStrong;
}

function getDefinedClassAST(
  className: string
): TSESTree.ClassDeclarationWithName
{
  const pathToFile = AllSourcesAndClasses.classToFile[className];
  assert(pathToFile, "require a path to file for class " + className);

  const program = AllSourcesAndClasses.programs[pathToFile];
  assert(program, "require a file at path " + pathToFile);

  const tsESTree_Class = findClassInAST(program, className);
  assert(tsESTree_Class, `require class ${className} in ${pathToFile}`);

  return tsESTree_Class;
}
