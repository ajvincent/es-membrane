import {
  HOLD_TYPE,
  IdentifierOwners,
} from "./IdentifierOwners.js";

import {
  SourceClassMap
} from "./loadReferences.js";

import {
  SourceClassMethod,
  SourceClassReferences,
} from "./SourceClass.js";

export interface ParameterLocation {
  className: string;
  methodName: string;
  parameterName: string;
}

export default function hasStrongParameterReference(
  { className, methodName, parameterName }: ParameterLocation,
): boolean
{
  const sourceClass: SourceClassReferences | undefined = SourceClassMap.get(className);
  if (!sourceClass)
    throw new Error(`source class "${className}" not found`);

  const method: SourceClassMethod | undefined = sourceClass.methods[methodName];
  if (!method)
    throw new Error(`method "${methodName}" not found in source class ${className}`);

  const parameter: IdentifierOwners | undefined = method.parameters.find(param => param.identifier === parameterName);
  if (!parameter)
    throw new Error(`${className}::${method} has no parameter "${parameterName}"`);

  let foundStrong = false;

  const indeterminates: Error[] = [];
  for (const reference of parameter.references) {
    if (reference.holdType === HOLD_TYPE.Strong)
      foundStrong = true;
    else if (reference.holdType === HOLD_TYPE.Indeterminate)
      indeterminates.push(new Error(
        `indeterminate reference: ${reference.identifierSequence.join("::")}@${
          reference.statementLocation?.start.line
        }`
      ));
  }

  if (indeterminates.length) {
    throw new AggregateError(
      indeterminates,
      `${className}::${method}(${parameterName}), unable to determine if reference is strong or weak`
    );
  }

  return foundStrong;
}
