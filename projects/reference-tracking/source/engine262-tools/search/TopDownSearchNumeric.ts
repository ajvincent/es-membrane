import type {
  ReadonlyDeep,
} from "type-fest";

import {
  BuiltInJSTypeName
} from "../../utilities/constants.js";

import type {
  ChildToParentReferenceGraphEdge,
  CollectionToKeyValueEdge,
  ReferenceGraphNode,
  ReferenceGraph,
} from "../../types/ReferenceGraph.d.ts";

import type {
  TopDownSearchNumericIfc,
  ParentToChildEdge
} from "../types/TopDownSearchNumericIfc.js";

import {
  ReferenceGraphImpl
} from "./ReferenceGraphImpl.js";

export class TopDownSearchNumeric
implements TopDownSearchNumericIfc
{
  succeeded: boolean = false;
  foundTargetValue: boolean = false;

  readonly #writableGraph = new ReferenceGraphImpl;
  readonly referenceGraph: ReadonlyDeep<ReferenceGraph> = this.#writableGraph;

  #graphObjectToReferenceNodeMap = new WeakMap<object, ReferenceGraphNode>;
  #symbolToReferenceNodeMap = new WeakMap<symbol, number>;
  #objectAndSymbolKeyCount = 0;
  #parentToEdgeIdCount = 0;

  readonly #resolvedNodeKeys = new Set<number>;
  readonly #strongReferencesOnly: boolean;

  constructor(
    strongReferencesOnly: boolean,
  )
  {
    this.#strongReferencesOnly = strongReferencesOnly;
    void(this.#strongReferencesOnly);
  }

  public retrieveObjectKey(
    graphObject: object
  ): number | undefined
  {
    return this.#graphObjectToReferenceNodeMap.get(graphObject)?.objectKey;
  }

  public defineGraphNode(
    graphObject: object,
    builtInClassName: BuiltInJSTypeName,
    derivedClassName: string
  ): number
  {
    if (this.#graphObjectToReferenceNodeMap.has(graphObject))
      throw new Error("graph object already defined");

    const objectKey = this.#objectAndSymbolKeyCount++;
    const node: ReferenceGraphNode = {
      objectKey,
      builtInJSTypeName: builtInClassName,
      derivedClassName
    };
    this.#writableGraph.nodes.push(node);
    this.#graphObjectToReferenceNodeMap.set(graphObject, node);
    return objectKey;
  }

  obtainSymbolKey(
    graphSymbol: symbol
  ): number
  {
    let key = this.#symbolToReferenceNodeMap.get(graphSymbol);
    if (key === undefined) {
      key = this.#objectAndSymbolKeyCount++;
      this.#symbolToReferenceNodeMap.set(graphSymbol, key);
    }
    return key;
  }

  public getNextParentToChildEdgeId(): number {
    return this.#parentToEdgeIdCount++;
  }

  public resolveReferenceNode(node: ReferenceGraphNode): void {
    this.#resolvedNodeKeys.add(node.objectKey);
  }

  public getGraphNodeIterator(): Iterator<number> {
    return this.#resolvedNodeKeys.values();
  }

  addChildToParentEdge(childEdge: ChildToParentReferenceGraphEdge): void {
    void(childEdge);
    throw new Error("Method not implemented.");
  }

  addParentToChildEdge(parentToChildEdge: ParentToChildEdge): void {
    void(parentToChildEdge);
    throw new Error("Method not implemented.");
  }

  addCollectionToKeyValueEdge(collectionEdge: CollectionToKeyValueEdge): void {
    void(collectionEdge);
    throw new Error("Method not implemented.");
  }
}
