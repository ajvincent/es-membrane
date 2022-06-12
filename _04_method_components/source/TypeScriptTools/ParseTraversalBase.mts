import TypeScript from "typescript";
import fs from "fs/promises";

import { SingletonPromise } from "../../../build/source/utilities/PromiseTypes.mjs";

type Concat<prefix extends string, value extends string> = `${prefix}${value}`;
type SyntaxKeys = keyof typeof TypeScript.SyntaxKind;

type EnterSyntaxCallback = (node: TypeScript.Node) => boolean;
type LeaveSyntaxCallback = (node: TypeScript.Node) => void;

export type SyntaxCallbackObject = {
  [Property in SyntaxKeys as Concat<"enter", Property>]?: EnterSyntaxCallback;
} & {
  [Property in SyntaxKeys as Concat<"leave", Property>]?: LeaveSyntaxCallback;
};

export class ParseTraversalBase
{
  static #kindToNameMap: ReadonlyMap<string | TypeScript.SyntaxKind, string> = new Map(
    Object.entries(TypeScript.SyntaxKind).map((([key, stringOrKind]) => [stringOrKind, key]))
  );

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
    const source = await fs.readFile(this.#pathToFile, { encoding: "utf-8"});
    const sourceFile = TypeScript.createSourceFile(
      this.#pathToFile,
      source,
      {
        languageVersion: TypeScript.ScriptTarget.ES2022
      },
      false
    );

    TypeScript.forEachChild(sourceFile, this.#visitNodeInternal);
  }
  // #endregion Parse file and start iteration

  // #region traversal support
  callbacks: SyntaxCallbackObject = {};

  skipTypes:           ReadonlySet<TypeScript.SyntaxKind> = new Set;
  rejectTypes:         ReadonlySet<TypeScript.SyntaxKind> = new Set;
  rejectChildrenTypes: ReadonlySet<TypeScript.SyntaxKind> = new Set;

  #visitNodeInternal = (node: TypeScript.Node) : void =>
  {
    if (this.rejectTypes.has(node.kind))
      return;

    const mustSkip = this.skipTypes.has(node.kind);
    const callbackType = ParseTraversalBase.#kindToNameMap.get(node.kind) as SyntaxKeys;
    const enterCallbackType = ("enter" + callbackType) as Concat<"enter", SyntaxKeys>;
    const leaveCallbackType = ("leave" + callbackType) as Concat<"leave", SyntaxKeys>;

    let rejectChildren = this.rejectChildrenTypes.has(node.kind);
    if (!mustSkip) {
      if (this.callbacks[enterCallbackType]) {
        const acceptChildren = (this.callbacks[enterCallbackType] as EnterSyntaxCallback)(node);
        rejectChildren ||= !acceptChildren;
      }

      else if (!this.callbacks[leaveCallbackType])
        this.unsupportedNode(callbackType, node);
    }

    if (!rejectChildren)
      TypeScript.forEachChild(node, this.#visitNodeInternal);

    if (!mustSkip && this.callbacks[leaveCallbackType]) {
      (this.callbacks[leaveCallbackType] as LeaveSyntaxCallback)(node);
    }
  }

  unsupportedNode(kind: string, node: TypeScript.Node) : boolean
  {
    console.warn("Unsupported node kind: ", kind, node);
    return false;
  }
  // #endregion traversal support
}
