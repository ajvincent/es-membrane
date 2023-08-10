import {
  Node,
  Structures,
  TypeNode,
} from "ts-morph";

import {
  TypeNodeToTypeStructure
} from "../types/TypeNodeToTypeStructure.mjs";

import StructureBase from "../decorators/StructureBase.mjs";

import {
  CallSignatureDeclarationImpl,
  ClassDeclarationImpl,
  ConstructSignatureDeclarationImpl,
  ConstructorDeclarationImpl,
  ConstructorDeclarationOverloadImpl,
  FunctionDeclarationImpl,
  FunctionDeclarationOverloadImpl,
  GetAccessorDeclarationImpl,
  IndexSignatureDeclarationImpl,
  MethodDeclarationImpl,
  MethodDeclarationOverloadImpl,
  MethodSignatureImpl,
  ParameterDeclarationImpl,
  PropertyDeclarationImpl,
  PropertySignatureImpl,
  SetAccessorDeclarationImpl,
  TypeAliasDeclarationImpl,
  TypeParameterDeclarationImpl,
  TypeStructure,
  VariableDeclarationImpl,
} from "../../exports.mjs";

export default function buildTypesForStructures(
  structureMap: ReadonlyMap<Structures, Node>,
  userConsole: Parameters<TypeNodeToTypeStructure>[1],
  converter: TypeNodeToTypeStructure
): void
{
  for (const [structure, node] of structureMap) {
    if (!(structure instanceof StructureBase)) {
      throw new Error("Cannot convert a structure which is not type-structure-aware");
    }

    if (
      (structure instanceof ParameterDeclarationImpl) ||
      (structure instanceof PropertyDeclarationImpl) ||
      (structure instanceof PropertySignatureImpl) ||
      (structure instanceof TypeAliasDeclarationImpl) ||
      (structure instanceof VariableDeclarationImpl) ||
      false
    )
    {
      if (!Node.isTyped(node)) {
        throw new Error("assertion failure, we should have a typed node");
      }
      runConversion(
        node.getTypeNode(),
        userConsole,
        converter,
        typeStructure => structure.typeStructure = typeStructure
      );
    }

    if (
      (structure instanceof CallSignatureDeclarationImpl) ||
      (structure instanceof ConstructorDeclarationImpl) ||
      (structure instanceof ConstructorDeclarationOverloadImpl) ||
      (structure instanceof ConstructSignatureDeclarationImpl) ||
      (structure instanceof FunctionDeclarationImpl) ||
      (structure instanceof FunctionDeclarationOverloadImpl) ||
      (structure instanceof GetAccessorDeclarationImpl) ||
      (structure instanceof IndexSignatureDeclarationImpl) ||
      (structure instanceof MethodDeclarationImpl) ||
      (structure instanceof MethodDeclarationOverloadImpl) ||
      (structure instanceof MethodSignatureImpl) ||
      (structure instanceof SetAccessorDeclarationImpl) ||
      false
    )
    {
      if (!Node.isReturnTyped(node)) {
        throw new Error("assertion failure, we should have a return-typed node");
      }
      runConversion(
        node.getReturnTypeNode(),
        userConsole,
        converter,
        typeStructure => structure.returnTypeStructure = typeStructure
      );
    }

    if (structure instanceof TypeParameterDeclarationImpl) {
      if (!Node.isTypeParameterDeclaration(node)) {
        throw new Error("assertion failure, we should have a type parameter declaration");
      }

      runConversion(
        node.getConstraint(),
        userConsole,
        converter,
        typeStructure => structure.constraintStructure = typeStructure
      );

      runConversion(
        node.getDefault(),
        userConsole,
        converter,
        typeStructure => structure.defaultStructure = typeStructure
      );
    }

    if (structure instanceof ClassDeclarationImpl) {
      if (!Node.isClassDeclaration(node))
        throw new Error("assertion failure, we should have a class declaration");

      throw new Error("work in progress");
      /*
      node.getImplements().forEach(implementsNode => {

      });
      runConversion(
        node.getImplements(),
        userConsole,
        converter,
        typeStructure => structure.implements = typeStructure
      );
      */
    }
  }
}

function runConversion(
  typeNode: TypeNode | undefined,
  userConsole: Parameters<TypeNodeToTypeStructure>[1],
  converter: TypeNodeToTypeStructure,
  callback: (typeStructure: TypeStructure) => void
): void
{
  if (!typeNode)
    return;
  const typeStructure = converter(typeNode, userConsole);
  if (typeStructure)
    callback(typeStructure);
}
