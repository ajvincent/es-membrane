import fs from "fs/promises";

import TSESTree from "@typescript-eslint/typescript-estree";

import { DefaultWeakMap }   from "../../../_01_stage_utilities/source/DefaultMap.mjs";
import { SingletonPromise } from "../../../_01_stage_utilities/source/PromiseTypes.mjs";

type TSNode = TSESTree.TSESTree.Node;

export default class ESTreeBase
{
  // #region constructor fields
  #pathToFile: string;
  constructor(pathToFile: string)
  {
    this.#pathToFile = pathToFile;
  }
  // #endregion constructor fields

  // #region Parse file and start iteration
  async run() : Promise<void>
  {
    return await this.#runPromise.run();
  }

  #runPromise: SingletonPromise<void> = new SingletonPromise(
    async () => await this.#run()
  );

  async #run(): Promise<void>
  {
    const sourceContents = await fs.readFile(this.#pathToFile, { encoding: "utf-8"});
    const ast = TSESTree.parse(
      sourceContents,
      {
        errorOnUnknownASTType: false,
        filePath: this.#pathToFile
      }
    );

    this.#traverseJustEnter(ast);
    this.#traverseEnterAndLeave(ast);
  }
  // #endregion Parse file and start iteration

  // #region Tree traversal

  #traverseJustEnter(ast: TSNode) : void
  {
    // First pass: Fill parent-to-children mapping so we can recursively walk it for enter and leave
    TSESTree.simpleTraverse(
      ast, {
        enter: (node: TSNode, parent?: TSNode) : void =>
        {
          if (parent)
            this.#parentToChildren.getDefault(parent, () => []).push(node);
        }
      },
      true
    );
  }

  #parentToChildren: DefaultWeakMap<TSNode, TSNode[]> = new DefaultWeakMap;

  enter(node: TSNode): boolean
  {
    void(node);
    return true;
  }

  leave(node: TSNode): void
  {
    void(node);
  }

  skipTypes: ReadonlySet<string> = new Set;
  rejectTypes: ReadonlySet<string> = new Set;
  rejectChildrenTypes: ReadonlySet<string> = new Set;

  #traverseEnterAndLeave = (node: TSNode) : void =>
  {
    if (this.rejectTypes.has(node.type))
      return;

    const mustSkip = this.skipTypes.has(node.type);

    let rejectChildren = this.rejectChildrenTypes.has(node.type);
    if (!mustSkip) {
      const acceptChildren = this.enter(node);
      rejectChildren ||= !acceptChildren;
    }

    if (!rejectChildren) {
      const children = this.#parentToChildren.get(node) ?? [];
      children.forEach(this.#traverseEnterAndLeave);
    }

    if (!mustSkip) {
      this.leave(node);
    }
  }

  // #endregion Tree traversal
}
