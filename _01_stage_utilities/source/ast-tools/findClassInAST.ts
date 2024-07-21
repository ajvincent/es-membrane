import { TSESTree } from "@typescript-eslint/typescript-estree";


import * as Acorn from "acorn";

import * as AcornWalkers from "acorn-walk";

export default function findClassInAST(
  ast: TSESTree.Program,
  className: string,
): TSESTree.ClassDeclaration | undefined
{
// type.startsWith("TS") is a good test for TypeScript-unique types
  const findNodeBase: AcornWalkers.RecursiveVisitors<any> = {
    ...AcornWalkers.base
  };
  for (const key in TSESTree.AST_NODE_TYPES) {
    if (key.startsWith("TS"))
      (findNodeBase as Record<string, any>)[key] = () => {};
  }

  const classAST: TSESTree.ClassDeclaration | undefined = AcornWalkers.findNodeAt<Acorn.Class>(
    ast as unknown as Acorn.Program,
    undefined,
    undefined,
    (nodeType: string, node: Acorn.Node): boolean => {
      if ((nodeType !== "Class") && (nodeType !== "ClassDeclaration"))
        return false;
      return (node as Acorn.Class).id?.name === className;
    },
    findNodeBase
  )?.node as TSESTree.ClassDeclaration | undefined;

  return classAST;
}
