import fs from "node:fs/promises";

import {
  parse,
  TSESTree,
} from '@typescript-eslint/typescript-estree';

export const astToSourcePath = new WeakMap<TSESTree.Program, string>;

export default async function parseSourceFile(
  pathToTypeScriptFile: string
): Promise<TSESTree.Program>
{
  const tsSource = await fs.readFile(pathToTypeScriptFile, { encoding: "utf-8" });
  const ast: TSESTree.Program = parse(tsSource, { loc: true, range: true }) as TSESTree.Program;
  astToSourcePath.set(ast, pathToTypeScriptFile);
  return ast;
}
