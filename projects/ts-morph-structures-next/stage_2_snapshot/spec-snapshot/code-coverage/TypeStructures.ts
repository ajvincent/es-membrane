import {
  CallExpression,
  type FunctionDeclaration,
  Node,
  type Statement,
  SyntaxKind,
  type SourceFile,
  ClassDeclaration,
  StructureKind
} from "ts-morph";

import {
  TS_MORPH_D
} from "#utilities/source/ts-morph-d-file.js";

import getTS_SourceFile from "#utilities/source/getTS_SourceFile.js";

import AwaitedMap from "#utilities/source/AwaitedMap.js";
import { DefaultMap } from "#utilities/source/DefaultMap.js";

import {
  ClassDeclarationImpl,
  PropertyDeclarationImpl,
  TypeStructureKind,
  VoidTypeNodeToTypeStructureConsole,
  getTypeAugmentedStructure,
} from "#stage_two/snapshot/dist/exports.js";

import {
  stageDir
} from "../../pre-build/constants.js";

it("convertTypeNode covers all possible type nodes", () => {
  const foundMethodsOfNode: string[] = [];
  {
    const CONVERT_FILE: SourceFile = getTS_SourceFile(stageDir, "snapshot/source/bootstrap/convertTypeNode.ts");
    const fnNode: FunctionDeclaration = CONVERT_FILE.getFunctionOrThrow("convertTypeNode");
    const fnStatements: readonly Statement[] = fnNode.getStatements();
    for (const statement of fnStatements) {
      if (Node.isIfStatement(statement)) {
        const callExpression = statement.getExpressionIfKind(SyntaxKind.CallExpression);
        if (!callExpression)
          continue;
        const outerExpr = callExpression.getExpressionIfKind(SyntaxKind.PropertyAccessExpression);
        if (!outerExpr)
          continue;
        const innerExpr = outerExpr.getExpressionIfKind(SyntaxKind.Identifier);
        if (!innerExpr || innerExpr.getText() !== "Node")
          continue;

        foundMethodsOfNode.push(outerExpr.getName());
      }
    }
  }

  const staticAssertMethods = new Map<PropertyDeclarationImpl, string>;
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
      const returnType = prop.typeStructure.returnType;
      if (!returnType)
        continue;
      if (returnType.kind !== TypeStructureKind.TypePredicate)
        continue;
      const isType = returnType.isType;
      if (isType?.kind !== TypeStructureKind.Literal)
        continue;
      staticAssertMethods.set(prop, isType.stringValue);
    }
  }

  /*
  const typeNodeClasses = TS_MORPH_D.getClassOrThrow("TypeNode").getDerivedClasses();
  */
  const typeNodeClasses = new Map<string, ClassDeclaration>;
  typeNodeClasses.set("TypeNode", TS_MORPH_D.getClassOrThrow("TypeNode"));
  for (const classNode of typeNodeClasses.values()) {
    const derivedClasses: ClassDeclaration[] = classNode.getDerivedClasses();
    for (const dc of derivedClasses) {
      const name = dc.getName();
      if (name)
        typeNodeClasses.set(name, dc);
    }
  }
  /*
  const typeClassNames: Set<string> = new Set();
  {
    const resolversMap = new Map<string, PromiseWithResolvers<boolean>["resolve"]>;
    const classesMap = new AwaitedMap<string, boolean>;
    resolversMap.set("Node", Boolean);
    resolversMap.set("TypeNode", Boolean);
    classesMap.set("Node", Promise.resolve(false));
    classesMap.set("TypeNode", Promise.resolve(true));

    for (const classNode of TS_MORPH_D.getClasses()) {
      const className = classNode.getName();
      if (!className)
        continue;

      // export declare class LiteralTypeNode extends TypeNode<ts.LiteralTypeNode>
      const extendsClause = classNode.getExtends();
      if (!extendsClause)
        continue;
      const ident = extendsClause.getExpressionIfKind(SyntaxKind.Identifier);
      if (!ident)
        continue;
      const extendsName = ident.getText();

      if (!classesMap.has(extendsName)) {
        const { promise, resolve } = Promise.withResolvers<boolean>();
        resolversMap.set(extendsName, resolve);
        classesMap.set(extendsName, promise);
      }

      if (!classesMap.has(className)) {
        const { promise, resolve } = Promise.withResolvers<boolean>();
        resolversMap.set(className, resolve);
        classesMap.set(className, promise);
      }

      classesMap.get(className)!.then(resolversMap.get(extendsName)!);
    }

    for (const resolve of resolversMap.values()) {
      resolve(false);
    }
  }
  */
});

xit("convertTypeNode covers all possible type nodes (using structures to assess)", () => {
  // do nothing
});
