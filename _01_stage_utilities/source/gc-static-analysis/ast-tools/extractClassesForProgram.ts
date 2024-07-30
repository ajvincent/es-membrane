import fs from "node:fs/promises";

import {
  parse,
  TSESTree,
} from '@typescript-eslint/typescript-estree';

import * as Acorn from "acorn";
import * as AcornWalkers from "acorn-walk";

// type.startsWith("TS") is a good test for TypeScript-unique types
const IgnoreTSNodes_Base: AcornWalkers.RecursiveVisitors<any> = {
  ...AcornWalkers.base
};
for (const key in TSESTree.AST_NODE_TYPES) {
  if (key.startsWith("TS"))
    (IgnoreTSNodes_Base as Record<string, any>)[key] = () => {};
}

export default
async function extractClassesForProgram(
  pathToTypeScriptFile: string,
  /*ast: TSESTree.Program */
): Promise<TSESTree.ClassDeclaration[]>
{
  const tsSource = await fs.readFile(pathToTypeScriptFile, { encoding: "utf-8" });

  const ast = parse(tsSource, { loc: true, range: true });
  const classList: TSESTree.ClassDeclaration[] = [];

  AcornWalkers.simple(ast as unknown as Acorn.Program, {
    ClassDeclaration: function(node: Acorn.ClassDeclaration | Acorn.AnonymousClassDeclaration): void {
      if ((node.type === "ClassDeclaration") && node.id) {
        classList.push(node as unknown as TSESTree.ClassDeclarationWithName);
      }
    }
  }, IgnoreTSNodes_Base)

  return classList;
}
