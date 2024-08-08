import assert from "node:assert";
import {
  HOLD_TYPE,
  IdentifierOwners,
} from "./JSONClasses/IdentifierOwners.js";

import {
  SourceClassMap
} from "./loadReferences.js";

import {
  SourceClassMethod,
  SourceClassReferences,
} from "./JSONClasses/SourceClass.js";

export interface ParameterLocation {
  className: string;
  methodName: string;
  parameterName: string;
  externalReferences: string[];
}

export default function hasStrongParameterReference(
  {
    className,
    methodName,
    parameterName,
    externalReferences,
  }: ParameterLocation,
): boolean
{
  const sourceClass: SourceClassReferences | undefined = SourceClassMap.get(className);
  if (!sourceClass)
    throw new Error(`source class "${className}" not found`);

  const method: SourceClassMethod | undefined = sourceClass.methods[methodName];
  if (!method) {
    if (sourceClass.extendsClass) {
      return hasStrongParameterReference({
        className: sourceClass.extendsClass,
        methodName,
        parameterName,
        externalReferences
      });
    }

    throw new Error(`method "${methodName}" not found in source class ${className}`);
  }

  const parameter: IdentifierOwners | undefined = method.variables[parameterName];
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
      foundStrong ||= hasStrongParameterReference({
        className,
        methodName,
        parameterName: otherIdentifier,
        externalReferences
      });
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
