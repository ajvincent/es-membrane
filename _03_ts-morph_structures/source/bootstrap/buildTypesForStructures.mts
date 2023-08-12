// #region preamble

import {
  Node,
  StructureKind,
  Structures,
  TypeNode,
} from "ts-morph";

import {
  TypeNodeToTypeStructure, TypeNodeToTypeStructureConsole,
} from "../types/TypeNodeToTypeStructure.mjs";

import StructureBase from "../decorators/StructureBase.mjs";

import {
  ClassDeclarationImpl,
  InterfaceDeclarationImpl,
  ReturnTypedNodeTypeStructure,
  TypeParameterWithTypeStructures,
  TypeStructure,
  TypedNodeTypeStructure,
} from "../../exports.mjs";

// #endregion preamble

export interface BuildTypesForStructureFailures {
  message: string,
  typeNode: TypeNode
}

/**
 * Build type structures for structures with types.
 * @param structureMap - the map of structures to original nodes.
 * @param userConsole - a callback for conversion failures.
 * @param converter - a callback to convert a type node to a type structure.
 * @returns the messages and nodes where conversion fails.
 */
export default function buildTypesForStructures(
  structureMap: ReadonlyMap<Structures, Node>,
  userConsole: (message: string, failingTypeNode: TypeNode) => void,
  converter: TypeNodeToTypeStructure
): BuildTypesForStructureFailures[]
{
  const failures: BuildTypesForStructureFailures[] = [];

  function consoleTrap(message: string, failingTypeNode: TypeNode): void {
    userConsole(message, failingTypeNode);
    failures.push({message, typeNode: failingTypeNode});
  }

  for (const [structure, node] of structureMap) {
    if (!(structure instanceof StructureBase)) {
      throw new Error("Cannot convert a structure which is not type-structure-aware");
    }

    switch (structure.kind) {
      case StructureKind.Parameter:
      case StructureKind.Property:
      case StructureKind.PropertySignature:
      case StructureKind.TypeAlias:
      case StructureKind.VariableDeclaration:
      {
        if (!Node.isTyped(node)) {
          throw new Error("assertion failure, we should have a typed node");
        }
        runConversion(
          node.getTypeNode(),
          consoleTrap,
          converter,
          typeStructure => (
            structure as unknown as TypedNodeTypeStructure
          ).typeStructure = typeStructure
        );

        break;
      }

      case StructureKind.CallSignature:
      case StructureKind.Constructor:
      case StructureKind.ConstructorOverload:
      case StructureKind.ConstructSignature:
      case StructureKind.Function:
      case StructureKind.FunctionOverload:
      case StructureKind.GetAccessor:
      case StructureKind.IndexSignature:
      case StructureKind.Method:
      case StructureKind.MethodOverload:
      case StructureKind.MethodSignature:
      case StructureKind.SetAccessor:
      {
        if (!Node.isReturnTyped(node)) {
          throw new Error("assertion failure, we should have a return-typed node");
        }
        runConversion(
          node.getReturnTypeNode(),
          consoleTrap,
          converter,
          typeStructure => (
            structure as unknown as ReturnTypedNodeTypeStructure
          ).returnTypeStructure = typeStructure
        );
        break;
      }

      case StructureKind.TypeParameter:
      {
        if (!Node.isTypeParameterDeclaration(node)) {
          throw new Error("assertion failure, we should have a type parameter declaration");
        }
        runConversion(
          node.getConstraint(),
          consoleTrap,
          converter,
          typeStructure => (
            structure as unknown as TypeParameterWithTypeStructures
          ).constraintStructure = typeStructure
        );

        runConversion(
          node.getDefault(),
          consoleTrap,
          converter,
          typeStructure => (
            structure as unknown as TypeParameterWithTypeStructures
          ).defaultStructure = typeStructure
        );

        break;
      }

      case StructureKind.Class:
      {
        if (!Node.isClassDeclaration(node))
          throw new Error("assertion failure, we should have a class declaration");
        if (!(structure instanceof ClassDeclarationImpl)) {
          throw new Error("assertion failure, we should have a ClassDeclarationImpl");
        }

        runConversion(
          node.getExtends(),
          consoleTrap,
          converter,
          typeStructure => {
            structure.extendsStructure = typeStructure
          }
        );

        const _implementsArray: TypeStructure[] = [];
        const implementsTypeNodes: TypeNode[] = node.getImplements();
        implementsTypeNodes.forEach(implementsTypeNode => {
          runConversion(
            implementsTypeNode,
            consoleTrap,
            converter,
            typeStructure => _implementsArray.push(typeStructure)
          );
        });

        structure.implementsSet.replaceFromArray(_implementsArray);
        break;
      }

      case StructureKind.Interface:
      {
        if (!Node.isInterfaceDeclaration(node)) {
          throw new Error("assertion failure, we should have an interface declaration");
        }

        if (!(structure instanceof InterfaceDeclarationImpl)) {
          throw new Error("assertion failure, we should have an InterfaceDeclarationImpl");
        }

        const _extendsArray: TypeStructure[] = [];
        const extendsTypeNodes: TypeNode[] = node.getExtends();
        extendsTypeNodes.forEach(extendsTypeNode => {
          runConversion(
            extendsTypeNode,
            consoleTrap,
            converter,
            typeStructure => _extendsArray.push(typeStructure)
          )
        });

        structure.extendsSet.replaceFromArray(_extendsArray);
        break;
      }
    }
  }

  return failures;
}

/**
 * Attempt to convert one type node to a type structure.
 * @param typeNode - the type node.  May be undefined, in which case this is a no-op.
 * @param consoleTrap - a callback for conversion failures.
 * @param converter - a callback to convert a type node to a type structure.
 * @param callback - internal callback to use the returned type structure.
 * @returns
 *
 * @internal
 */
function runConversion(
  typeNode: TypeNode | undefined,
  consoleTrap: TypeNodeToTypeStructureConsole,
  converter: TypeNodeToTypeStructure,
  callback: (typeStructure: TypeStructure) => void
): void
{
  if (!typeNode)
    return;
  const typeStructure = converter(typeNode, consoleTrap);
  if (typeStructure)
    callback(typeStructure);
}
