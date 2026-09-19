import {
  type Expression,
  type FunctionDeclaration,
  Node,
  type Statement,
  SyntaxKind,
  type SourceFile,
  type ClassDeclaration,
} from "ts-morph";

import {
  getLeafSubclassesClassesOf,
} from "#utilities/source/ts-morph-d-file.js";

import getTS_SourceFile from "#utilities/source/getTS_SourceFile.js";

import {
  stageDir
} from "../../pre-build/constants.js";

import {
  getStaticAssertMethodsOfNode
} from "../../utilities/getStaticAssertMethodsOfNode.js";

it("convertTypeNode covers all possible type nodes", () => {
  // The leaf nodes are the ones which are unique classes.
  const leafTypeNodeClasses: ReadonlyMap<string, ClassDeclaration> = getLeafSubclassesClassesOf("TypeNode");

  // Get the list of methods returning type nodes.
  /* key: name of static method of Node.  value: class name in leafTypeNodeClasses */
  const staticAssertMethods: ReadonlyMap<string, string> = getStaticAssertMethodsOfNode(leafTypeNodeClasses);

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
  expect(missedMethodsOfNode).toEqual([
    "isJSDocAllType", /* "*" */
    "isJSDocFunctionType",
    "isJSDocNamepathType",
    "isJSDocNonNullableType",
    "isJSDocNullableType",
    "isJSDocOptionalType",
    "isJSDocSignature",
    "isJSDocTypeExpression",
    "isJSDocTypeLiteral",
    "isJSDocUnknownType", /* "?" */
    "isJSDocVariadicType",
  ]);
});

xit("convertTypeNode covers all possible type nodes (using structures to assess)", () => {
  // do nothing.  This is a test case for stage 3, but it's here to remind me to move it there.
});
