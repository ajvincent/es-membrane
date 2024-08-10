import assert from "node:assert/strict";
import type {
  TSESTree
} from "@typescript-eslint/typescript-estree";

import {
  Scope,
  type ScopeManager,
  Variable
} from '@typescript-eslint/scope-manager';

import {
  type SourceClassMethod,
} from "../JSONClasses/SourceClass.js";

import {
  IdentifierOwners
} from "../JSONClasses/IdentifierOwners.js";

export default function buildMethodReferences(
  localFilePath: string,
  sourceMethod: SourceClassMethod,
  tsESTree_Method: TSESTree.MethodDefinition,
  moduleScope: ScopeManager,
): void
{
  const methodScope: Scope | null = moduleScope.acquire(tsESTree_Method.value);
  assert(methodScope, "we must have a scope for " + tsESTree_Method.value.id);

  for (let index = 0; index < tsESTree_Method.value.params.length; index++) {
    const param = tsESTree_Method.value.params[index];
    const name = (param as TSESTree.Identifier).name;
    const paramAsVariable: Variable | undefined = methodScope.variables.find(v => v.name === (param as TSESTree.Identifier).name);
    assert(paramAsVariable, `no parameter variable ${name} for method ${tsESTree_Method.value.id}`);

    const owners = new IdentifierOwners();
    owners.argIndex = index;
    sourceMethod.variables[name] = owners;

    const matchingIdentifiers: TSESTree.Identifier[] = paramAsVariable.references.filter(
      ref => ref.isRead()
    ).map(
      ref => ref.identifier as TSESTree.Identifier
    );

    matchingIdentifiers.forEach(identifier => {
      addReference(localFilePath, owners, identifier);
    });
  }
}

function addReference(
  localFilePath: string,
  owners: IdentifierOwners,
  identifier: TSESTree.Identifier
): void
{
  let success = false;
  switch (identifier.parent.type) {
    case "CallExpression":
      success = addCallReferenceExpression(localFilePath, owners, identifier, identifier.parent);
      break;
  }

  if (success === false) {
    console.log(`${localFilePath}@${identifier.loc.start.line}:${identifier.loc.start.column}, ${identifier.name} in ${identifier.parent.type}`);
  }
}

function addCallReferenceExpression(
  localFilePath: string,
  owners: IdentifierOwners,
  identifier: TSESTree.Identifier,
  callExpresson: TSESTree.CallExpression
): boolean
{
  void(localFilePath);

  if (identifier === callExpresson.callee) {
    // identifier can't be held by the class this way
    return true;
  }

  let argIndex = callExpresson.arguments.indexOf(identifier);
  if (argIndex >= 0) {
    console.log(`${
      localFilePath
    }@${
      identifier.loc.start.line
    }:${
      identifier.loc.start.column
    }, ${
      identifier.name
    } is argument ${
      argIndex
    } in ${
      identifier.parent.type
    }`);
    return true;
  }

  return false;
}
