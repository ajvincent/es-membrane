// #region preamble
import assert from "node:assert/strict";

import {
  ClassDeclaration,
  IndexSignatureDeclaration,
  Node,
  ReturnTypedNode,
  StructureKind,
  TypeNode,
  TypeParameterDeclaration,
  TypedNode,
} from "ts-morph";

import {
  BuildTypesForStructureFailures,
  SubstructureResolver,
  TypeNodeToTypeStructure,
  TypeNodeToTypeStructureConsole,
} from "./types/conversions.js";

import type {
  StructureImpls,
  TypeStructureSet,
  TypeStructures,
  TypeStructuresOrNull,
} from "../exports.js";

// #endregion preamble

type TypeStructureKey<Key extends string> = {
  [key in Key]: TypeStructures | undefined | TypeStructureSet;
};

/**
 * Build type structures for structures with types.
 * @param structureMap - the map of structures to original nodes.
 * @param userConsole - a callback for conversion failures.
 * @param subStructureResolver - when we discover a node with its own structures to investigate.
 * @param converter - a callback to convert a type node to a type structure.
 * @returns the messages and nodes where conversion fails.
 *
 * This is really a routing mechanism.  For each node, it determines which type
 * nodes we need to create type structures for, then passes them off to the
 * converter to generate the type structure.  Finally, it assigns the resulting
 * type structure to the appropriate structure field.
 */
export default function buildTypesForStructures(
  structureMap: ReadonlyMap<StructureImpls, Node>,
  userConsole: TypeNodeToTypeStructureConsole,
  subStructureResolver: SubstructureResolver,
  converter: TypeNodeToTypeStructure,
): BuildTypesForStructureFailures[] {
  const failures: BuildTypesForStructureFailures[] = [];

  function consoleTrap(message: string, failingTypeNode: TypeNode): void {
    userConsole(message, failingTypeNode);
    failures.push({ message, failingTypeNode });
  }

  for (const [structure, node] of structureMap) {
    switch (structure.kind) {
      case StructureKind.Parameter:
      case StructureKind.Property:
      case StructureKind.PropertySignature:
      case StructureKind.TypeAlias:
      case StructureKind.VariableDeclaration: {
        assert(Node.isTyped(node), "we should have a typed node");
        convertTypeField(
          structure,
          node,
          consoleTrap,
          subStructureResolver,
          converter,
        );
        break;
      }

      case StructureKind.IndexSignature: {
        assert(
          Node.isIndexSignatureDeclaration(node),
          "we should have an index signature node",
        );
        convertKeyTypeField(
          structure,
          node,
          consoleTrap,
          subStructureResolver,
          converter,
        );
        // fall through to returnTypeStructure builder
      }

      case StructureKind.CallSignature:
      case StructureKind.Constructor:
      case StructureKind.ConstructorOverload:
      case StructureKind.ConstructSignature:
      case StructureKind.Function:
      case StructureKind.FunctionOverload:
      case StructureKind.GetAccessor:
      case StructureKind.Method:
      case StructureKind.MethodOverload:
      case StructureKind.MethodSignature:
      case StructureKind.SetAccessor: {
        assert(Node.isReturnTyped(node), "we should have a return-typed node");
        convertReturnTypeField(
          structure,
          node,
          consoleTrap,
          subStructureResolver,
          converter,
        );
        break;
      }

      case StructureKind.TypeParameter: {
        assert(
          Node.isTypeParameterDeclaration(node),
          "we should have a type parameter declaration",
        );
        convertConstraintField(
          structure,
          node,
          consoleTrap,
          subStructureResolver,
          converter,
        );
        convertDefaultField(
          structure,
          node,
          consoleTrap,
          subStructureResolver,
          converter,
        );
        break;
      }

      case StructureKind.Class: {
        assert(
          Node.isClassDeclaration(node),
          "we should have a class declaration",
        );
        convertExtendsFieldForClass(
          structure,
          node,
          consoleTrap,
          subStructureResolver,
          converter,
        );
        structure.implementsSet.clear();
        const implementsTypeNodes: TypeNode[] = node.getImplements();
        implementsTypeNodes.forEach((implementsTypeNode) => {
          convertImplementsTypeNodeForClass(
            structure,
            implementsTypeNode,
            consoleTrap,
            subStructureResolver,
            converter,
          );
        });
        break;
      }

      case StructureKind.Interface: {
        assert(
          Node.isInterfaceDeclaration(node),
          "we should have an interface declaration",
        );
        structure.extendsSet.clear();
        const extendsTypeNodes: TypeNode[] = node.getExtends();
        extendsTypeNodes.forEach((extendsTypeNode) => {
          convertExtendsTypeNodeForInterface(
            structure,
            extendsTypeNode,
            consoleTrap,
            subStructureResolver,
            converter,
          );
        });
        break;
      }
    }
  }

  return failures;
}

function convertTypeField(
  structure: Extract<StructureImpls, TypeStructureKey<"typeStructure">>,
  node: TypedNode,
  consoleTrap: TypeNodeToTypeStructureConsole,
  subStructureResolver: SubstructureResolver,
  converter: TypeNodeToTypeStructure,
): void {
  runConversion(
    node.getTypeNode(),
    consoleTrap,
    subStructureResolver,
    converter,
    (typeStructure) => (structure.typeStructure = typeStructure),
  );
}

function convertKeyTypeField(
  structure: Extract<StructureImpls, TypeStructureKey<"keyTypeStructure">>,
  node: IndexSignatureDeclaration,
  consoleTrap: TypeNodeToTypeStructureConsole,
  subStructureResolver: SubstructureResolver,
  converter: TypeNodeToTypeStructure,
): void {
  runConversion(
    node.getKeyTypeNode(),
    consoleTrap,
    subStructureResolver,
    converter,
    (typeStructure) => (structure.keyTypeStructure = typeStructure),
  );
}

function convertReturnTypeField(
  structure: Extract<StructureImpls, TypeStructureKey<"returnTypeStructure">>,
  node: ReturnTypedNode,
  consoleTrap: TypeNodeToTypeStructureConsole,
  subStructureResolver: SubstructureResolver,
  converter: TypeNodeToTypeStructure,
): void {
  runConversion(
    node.getReturnTypeNode(),
    consoleTrap,
    subStructureResolver,
    converter,
    (typeStructure) => (structure.returnTypeStructure = typeStructure),
  );
}

function convertConstraintField(
  structure: Extract<StructureImpls, TypeStructureKey<"constraintStructure">>,
  node: TypeParameterDeclaration,
  consoleTrap: TypeNodeToTypeStructureConsole,
  subStructureResolver: SubstructureResolver,
  converter: TypeNodeToTypeStructure,
): void {
  runConversion(
    node.getConstraint(),
    consoleTrap,
    subStructureResolver,
    converter,
    (typeStructure) => (structure.constraintStructure = typeStructure),
  );
}

function convertDefaultField(
  structure: Extract<StructureImpls, TypeStructureKey<"defaultStructure">>,
  node: TypeParameterDeclaration,
  consoleTrap: TypeNodeToTypeStructureConsole,
  subStructureResolver: SubstructureResolver,
  converter: TypeNodeToTypeStructure,
): void {
  runConversion(
    node.getDefault(),
    consoleTrap,
    subStructureResolver,
    converter,
    (typeStructure) => (structure.defaultStructure = typeStructure),
  );
}

function convertExtendsFieldForClass(
  structure: Extract<StructureImpls, TypeStructureKey<"extendsStructure">>,
  node: ClassDeclaration,
  consoleTrap: TypeNodeToTypeStructureConsole,
  subStructureResolver: SubstructureResolver,
  converter: TypeNodeToTypeStructure,
): void {
  runConversion(
    node.getExtends(),
    consoleTrap,
    subStructureResolver,
    converter,
    (typeStructure) => (structure.extendsStructure = typeStructure),
  );
}

function convertImplementsTypeNodeForClass(
  structure: Extract<StructureImpls, TypeStructureKey<"implementsSet">>,
  typeNode: TypeNode,
  consoleTrap: TypeNodeToTypeStructureConsole,
  subStructureResolver: SubstructureResolver,
  converter: TypeNodeToTypeStructure,
): void {
  runConversion(
    typeNode,
    consoleTrap,
    subStructureResolver,
    converter,
    (typeStructure) => structure.implementsSet.add(typeStructure),
  );
}

function convertExtendsTypeNodeForInterface(
  structure: Extract<StructureImpls, TypeStructureKey<"extendsSet">>,
  typeNode: TypeNode,
  consoleTrap: TypeNodeToTypeStructureConsole,
  subStructureResolver: SubstructureResolver,
  converter: TypeNodeToTypeStructure,
): void {
  runConversion(
    typeNode,
    consoleTrap,
    subStructureResolver,
    converter,
    (typeStructure) => structure.extendsSet.add(typeStructure),
  );
}

/**
 * Attempt to convert one type node to a type structure.
 * @param typeNode - the type node.  May be undefined, in which case this is a no-op.
 * @param consoleTrap - a callback for conversion failures.
 * @param subStructureResolver - when we discover a node with its own structures to investigate.
 * @param converter - a callback to convert a type node to a type structure.
 * @param callback - internal callback to use the returned type structure.
 * @returns
 *
 * @internal
 */
function runConversion(
  typeNode: TypeNode | undefined,
  consoleTrap: TypeNodeToTypeStructureConsole,
  subStructureResolver: SubstructureResolver,
  converter: TypeNodeToTypeStructure,
  callback: (typeStructure: TypeStructures) => void,
): void {
  if (!typeNode) return;
  const typeStructure: TypeStructuresOrNull = converter(
    typeNode,
    consoleTrap,
    subStructureResolver,
  );
  if (typeStructure) callback(typeStructure);
}
