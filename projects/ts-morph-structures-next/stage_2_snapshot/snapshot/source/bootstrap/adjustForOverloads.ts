import assert from "node:assert/strict";

import {
  type ConstructorDeclaration,
  type ConstructorDeclarationStructure,
  type ConstructorDeclarationOverloadStructure,
  type FunctionDeclaration,
  type FunctionDeclarationStructure,
  type FunctionDeclarationOverloadStructure,
  type MethodDeclaration,
  type MethodDeclarationStructure,
  type MethodDeclarationOverloadStructure,
  type StatementedNodeStructure,
  Structure,
  type Structures,
  StructureKind,
  SyntaxKind,
  type WriterFunction,
  forEachStructureChild,
} from "ts-morph";

import type { IterableElement } from "type-fest";

//#region move structure overloads inside their parent structures

/**
 * Remove function overloads preceding a function.
 * @param structure - The structure direct from ts-morph to clean up.
 * @internal
 */
export function fixFunctionOverloads(structure: Structures): void {
  if (
    Structure.isStatemented(structure) &&
    Array.isArray(structure.statements)
  ) {
    structure.statements = structure.statements.filter(
      excludeFunctionOverloads,
    );

    const wrapper: LastCallableWrapper<FunctionDeclarationStructure> = {
      lastCallable: undefined,
    };

    structure.statements = structure.statements.reduceRight(
      (
        collectedStatements: IteratedStatement[],
        statement: IteratedStatement,
      ): IteratedStatement[] => {
        return prependOverloadsOfKindInside<
          FunctionDeclarationStructure,
          IteratedStatement
        >(StructureKind.Function, wrapper, collectedStatements, statement);
      },
      [],
    );
  } else if (structure.kind === StructureKind.Class) {
    if (structure.methods && structure.methods.length > 0) {
      const wrapper: LastCallableWrapper<MethodDeclarationStructure> = {
        lastCallable: undefined,
      };

      structure.methods = (
        structure.methods as MethodDeclarationStructure[]
      ).reduceRight(
        (
          collectedMethods: MethodDeclarationStructure[],
          method: MethodDeclarationStructure,
        ): MethodDeclarationStructure[] => {
          return prependOverloadsOfKindInside<
            MethodDeclarationStructure,
            MethodDeclarationStructure
          >(StructureKind.Method, wrapper, collectedMethods, method);
        },
        [],
      );
    }

    if (structure.ctors && structure.ctors.length > 0) {
      const wrapper: LastCallableWrapper<ConstructorDeclarationStructure> = {
        lastCallable: undefined,
      };

      structure.ctors = (
        structure.ctors as ConstructorDeclarationStructure[]
      ).reduceRight(
        (
          collectedConstructors: ConstructorDeclarationStructure[],
          ctor: ConstructorDeclarationStructure,
        ): ConstructorDeclarationStructure[] => {
          return prependOverloadsOfKindInside<
            ConstructorDeclarationStructure,
            ConstructorDeclarationStructure
          >(StructureKind.Constructor, wrapper, collectedConstructors, ctor);
        },
        [],
      );
    }
  }

  forEachStructureChild(structure, fixFunctionOverloads);
}

type IteratedStatement = IterableElement<
  StatementedNodeStructure["statements"]
>;

class CallableDescription<
  DeclarationStructure extends
    | FunctionDeclarationStructure
    | MethodDeclarationStructure
    | ConstructorDeclarationStructure,
> {
  readonly isStatic: boolean;
  readonly kind: DeclarationStructure["kind"];
  readonly name?: string;

  readonly structure: DeclarationStructure;

  constructor(structure: DeclarationStructure) {
    this.isStatic =
      structure.kind === StructureKind.Method && (structure.isStatic ?? false);
    this.kind = structure.kind;
    this.name =
      structure.kind === StructureKind.Constructor
        ? "constructor"
        : structure.name;

    this.structure = structure;
  }

  isEquivalent(other: CallableDescription<DeclarationStructure>): boolean {
    return (
      this.isStatic === other.isStatic &&
      this.kind === other.kind &&
      this.name === other.name
    );
  }
}

type LastCallableWrapper<
  DeclarationStructure extends
    | FunctionDeclarationStructure
    | MethodDeclarationStructure
    | ConstructorDeclarationStructure,
> = {
  lastCallable: CallableDescription<DeclarationStructure> | undefined;
};

function excludeFunctionOverloads(
  statement: string | WriterFunction | Structures,
): boolean {
  return (
    typeof statement !== "object" ||
    statement.kind !== StructureKind.FunctionOverload
  );
}

function prependOverloadsOfKindInside<
  DeclarationStructure extends
    | FunctionDeclarationStructure
    | MethodDeclarationStructure
    | ConstructorDeclarationStructure,
  StatementType extends
    | IteratedStatement
    | MethodDeclarationStructure
    | ConstructorDeclarationStructure,
>(
  matchKind: DeclarationStructure["kind"],
  lastCallableWrapper: LastCallableWrapper<DeclarationStructure>,
  collectedFromBack: StatementType[],
  statement: StatementType,
): StatementType[] {
  if (typeof statement !== "object") {
    collectedFromBack.unshift(statement);
    lastCallableWrapper.lastCallable = undefined;
    return collectedFromBack;
  }

  if (statement.kind !== matchKind) {
    collectedFromBack.unshift(statement);
    lastCallableWrapper.lastCallable = undefined;
    return collectedFromBack;
  }

  const callable = statement as unknown as DeclarationStructure;

  if (
    callable.kind !== StructureKind.Constructor &&
    callable.name === undefined
  ) {
    collectedFromBack.unshift(statement);
    lastCallableWrapper.lastCallable = undefined;
    return collectedFromBack;
  }

  const description = new CallableDescription<DeclarationStructure>(callable);
  if (lastCallableWrapper.lastCallable === undefined) {
    collectedFromBack.unshift(statement);
    lastCallableWrapper.lastCallable = description;
    return collectedFromBack;
  }

  if (description.isEquivalent(lastCallableWrapper.lastCallable) === false) {
    collectedFromBack.unshift(statement);
    lastCallableWrapper.lastCallable = description;
    return collectedFromBack;
  }

  assert(
    statement.overloads === undefined || statement.overloads.length === 0,
    "why does a function with the same name in this statement block have overloads?",
  );
  assert(
    statement.statements === undefined || statement.statements.length === 0,
    "why does a function with the same name in this statement block have statements?",
  );
  if (statement.kind === StructureKind.Method) {
    assert(
      statement.decorators === undefined || statement.decorators.length === 0,
      "why does a method with the same name in this statement block have decorators?",
    );
  }

  // the statement is actually an overload

  const { structure: parentStructure } = lastCallableWrapper.lastCallable;
  parentStructure.overloads ??= [];

  if (parentStructure.kind === StructureKind.Function) {
    assert.equal(statement.kind, StructureKind.Function);
    prependOverload<
      FunctionDeclarationStructure,
      FunctionDeclarationOverloadStructure
    >(parentStructure, statement, StructureKind.FunctionOverload);
    Reflect.deleteProperty(statement, "name");
  } else if (parentStructure.kind === StructureKind.Method) {
    assert.equal(statement.kind, StructureKind.Method);
    prependOverload<
      MethodDeclarationStructure,
      MethodDeclarationOverloadStructure
    >(parentStructure, statement, StructureKind.MethodOverload);
    delete statement.decorators;
    Reflect.deleteProperty(statement, "name");
  } else if (parentStructure.kind === StructureKind.Constructor) {
    assert.equal(statement.kind, StructureKind.Constructor);
    prependOverload<
      ConstructorDeclarationStructure,
      ConstructorDeclarationOverloadStructure
    >(parentStructure, statement, StructureKind.ConstructorOverload);
  }

  return collectedFromBack;
}

function prependOverload<
  ParentStructure extends
    | FunctionDeclarationStructure
    | MethodDeclarationStructure
    | ConstructorDeclarationStructure,
  OverloadStructure extends
    | FunctionDeclarationOverloadStructure
    | MethodDeclarationOverloadStructure
    | ConstructorDeclarationOverloadStructure,
>(
  parentStructure: ParentStructure,
  overloadStructure: ParentStructure,
  kind: OverloadStructure["kind"],
): OverloadStructure {
  delete overloadStructure.statements;
  delete overloadStructure.overloads;

  const overload = overloadStructure as unknown as OverloadStructure;
  overload.kind = kind;
  parentStructure.overloads ||= [];
  (parentStructure.overloads as OverloadStructure[]).unshift(overload);

  return overload;
}

//#endregion move structure overloads inside their parent structures

export function getOverloadIndex<
  NodeType extends
    | ConstructorDeclaration
    | FunctionDeclaration
    | MethodDeclaration,
>(node: NodeType): number {
  const kind = node.getKind() as
    | SyntaxKind.Constructor
    | SyntaxKind.FunctionDeclaration
    | SyntaxKind.MethodDeclaration;
  let matchingNodes = node
    .getParentOrThrow()
    .getChildrenOfKind(kind) as NodeType[];

  switch (kind) {
    case SyntaxKind.Constructor:
      matchingNodes = matchingNodes.slice();
      break;

    case SyntaxKind.FunctionDeclaration: {
      const name = (node as FunctionDeclaration).getName();
      if (name === undefined) return -1;
      matchingNodes = (matchingNodes as FunctionDeclaration[]).filter(
        (n) => n.getName() === name,
      ) as NodeType[];
      break;
    }

    case SyntaxKind.MethodDeclaration: {
      const name = (node as MethodDeclaration).getName();
      const isStatic = (node as MethodDeclaration).isStatic();
      matchingNodes = (matchingNodes as MethodDeclaration[]).filter(
        (n) => n.isStatic() === isStatic && n.getName() === name,
      ) as NodeType[];
      break;
    }
  }

  matchingNodes.pop();
  return matchingNodes.indexOf(node);
}
