import {
  type Expression,
  type FunctionDeclaration,
  Node,
  type Statement,
  SyntaxKind,
  type SourceFile,
  ClassDeclaration,
  StructureKind,
} from "ts-morph";

import {
  TS_MORPH_D,
  getClassToDerivedMap,
} from "#utilities/source/ts-morph-d-file.js";

import getTS_SourceFile from "#utilities/source/getTS_SourceFile.js";

import {
  ClassDeclarationImpl,
  TypeStructureKind,
  type TypeStructures,
  VoidTypeNodeToTypeStructureConsole,
  getTypeAugmentedStructure,
} from "#stage_two/snapshot/dist/exports.js";

import {
  stageDir
} from "../../pre-build/constants.js";

it("convertTypeNode covers all possible type nodes", () => {
  // The leaf nodes are the ones which are unique classes.
  const leafTypeNodeClasses = new Map<string, ClassDeclaration>;
  {
    const classToDerivedMap: ReadonlyMap<ClassDeclaration, readonly ClassDeclaration[]> = getClassToDerivedMap();
    const allTypeNodeClasses = new Set<ClassDeclaration>;
    allTypeNodeClasses.add(TS_MORPH_D.getClassOrThrow("TypeNode"));
    for (const classDecl of allTypeNodeClasses) {
      const derivedClasses: readonly ClassDeclaration[] = classToDerivedMap.get(classDecl) ?? [];
      if (derivedClasses.length === 0) {
        leafTypeNodeClasses.set(classDecl.getNameOrThrow(), classDecl);
      } else {
        for (const subclassDecl of derivedClasses) {
          allTypeNodeClasses.add(subclassDecl);
        }
      }
    }
  }

  // Get the list of methods returning type nodes.
  /* key: name of static method of Node.  value: class name in leafTypeNodeClasses */
  const staticAssertMethods = new Map<string, string>;
  {
    const nodeClass: ClassDeclarationImpl = getTypeAugmentedStructure(
      TS_MORPH_D.getClassOrThrow("Node"), VoidTypeNodeToTypeStructureConsole, true, StructureKind.Class
    ).rootStructure;

    for (const prop of nodeClass.properties) {
      if (!prop.name.startsWith("is"))
        continue;
      if (!prop.isStatic)
        continue;
      if (prop.typeStructure?.kind !== TypeStructureKind.Function)
        continue;
      const returnType: TypeStructures | undefined = prop.typeStructure.returnType;
      if (!returnType)
        continue;
      if (returnType.kind !== TypeStructureKind.TypePredicate)
        continue;
      const isType = returnType.isType;
      if (isType?.kind !== TypeStructureKind.Literal)
        continue;

      if (!leafTypeNodeClasses.has(isType.stringValue))
        continue;
      staticAssertMethods.set(prop.name, isType.stringValue);
    }

    for (const method of nodeClass.methods) {
      if (!method.name.startsWith("is"))
        continue;
      if (!method.isStatic)
        continue;
      const returnType: TypeStructures | undefined = method.returnTypeStructure;
      if (!returnType)
        continue;
      if (returnType.kind !== TypeStructureKind.TypePredicate)
        continue;
      const isType = returnType.isType;
      if (isType?.kind !== TypeStructureKind.Literal)
        continue;

      if (!leafTypeNodeClasses.has(isType.stringValue))
        continue;
      staticAssertMethods.set(method.name, isType.stringValue);
    }
  }

  // these are the static methods of Node that convertNode should be calling.
  const expectedMethodsOfNode = new Set<string>(staticAssertMethods.keys());

  // these are the static methods of Node that convertNode actually calls.
  const foundMethodsOfNode = new Set<string>;
  {
    const CONVERT_FILE: SourceFile = getTS_SourceFile(stageDir, "snapshot/source/bootstrap/convertTypeNode.ts");
    const fnNode: FunctionDeclaration = CONVERT_FILE.getFunctionOrThrow("convertTypeNode");
    const fnStatements: Statement[] = Array.from(fnNode.getStatements());

    const expressionsQueue: Expression[] = [];

    for (const statement of fnStatements) {
      if (Node.isIfStatement(statement)) {
        if (Node.isIfStatement(statement.getElseStatement())) {
          fnStatements.push(statement.getElseStatement()!);
        }

        const expression: Expression = statement.getExpression();
        expressionsQueue.push(expression);
      }
    }

    for (const expression of expressionsQueue) {
      switch (expression.getKind()) {
        case SyntaxKind.CallExpression: {
          const callExpression = expression.asKindOrThrow(SyntaxKind.CallExpression);
          const outerExpr = callExpression.getExpressionIfKind(SyntaxKind.PropertyAccessExpression);
          if (!outerExpr)
            continue;
          const innerExpr = outerExpr.getExpressionIfKind(SyntaxKind.Identifier);
          if (!innerExpr || innerExpr.getText() !== "Node")
            continue;

          foundMethodsOfNode.add(outerExpr.getName());
          break;
        }

        case SyntaxKind.BinaryExpression: {
          const binExpression = expression.asKindOrThrow(SyntaxKind.BinaryExpression);
          expressionsQueue.push(binExpression.getLeft(), binExpression.getRight());
          break;
        }

        case SyntaxKind.Identifier:
          break;

        default:
          throw new Error("unknown expression kind: " + expression.getKindName() + " at " + expression.getStartLineNumber());
      }
    }
  }

  const missedMethodsOfNode = Array.from(expectedMethodsOfNode.difference(foundMethodsOfNode));
  missedMethodsOfNode.sort();
  expect(missedMethodsOfNode).toEqual([]);
});

xit("convertTypeNode covers all possible type nodes (using structures to assess)", () => {
  // do nothing
});
