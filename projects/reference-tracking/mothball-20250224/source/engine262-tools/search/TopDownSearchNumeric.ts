import type {
  ReadonlyDeep,
} from "type-fest";

import {
  BuiltInJSTypeName,
  TARGET_NODE_KEY,
  PRESUMED_HELD_NODE_KEY,
} from "../../utilities/constants.js";

import type {
  ChildToParentReferenceGraphEdge,
  CollectionToKeyValueEdge,
  ReferenceGraphNode,
  ReferenceGraph,
  ParentToChildReferenceGraphEdge,
} from "../../types/ReferenceGraph.d.ts";

import type {
  TopDownSearchNumericIfc,
} from "../types/TopDownSearchNumericIfc.js";

import {
  ChildEdgeReferenceTracker,
} from "./ChildEdgeReferenceTracker.js";

import {
  ReferenceGraphImpl,
} from "./ReferenceGraphImpl.js";

export class TopDownSearchNumeric
implements TopDownSearchNumericIfc
{
  static #hashChildToParentEdge(
    this: void,
    childObjectKey: number,
    jointOwnerKeys: readonly number[],
    parentToChildEdgeId: number,
  ): string
  {
    return JSON.stringify({ childObjectKey, jointOwnerKeys, parentToChildEdgeId });
  }

  readonly #writableGraph = new ReferenceGraphImpl;
  readonly referenceGraph: ReadonlyDeep<ReferenceGraph> = this.#writableGraph;

  readonly #graphObjectToReferenceNodeMap = new WeakMap<object, ReferenceGraphNode>;
  readonly #symbolToReferenceNodeMap = new WeakMap<symbol, number>;
  #objectAndSymbolKeyCount = 0;
  #parentToEdgeIdCount = 0;

  readonly #parentKeyToParentEdges = new Map<number, ParentToChildReferenceGraphEdge[]>;

  readonly #strongReferenceKeys = new Set<number>;
  readonly #excludedObjectKeysForStrongReferences = new Set<number>;
  readonly #strongChildEdgeTracker = new ChildEdgeReferenceTracker(this.#strongChildEdgesResolver.bind(this));
  readonly #childEdgesMap = new Map<string, ChildToParentReferenceGraphEdge>;
  #markStrongReferencesStarted = false;

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
    if (this.#markStrongReferencesStarted)
      throw new Error("readonly state: you've already started marking strong references");
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

    this.#strongChildEdgeTracker.defineKey(objectKey);

    return objectKey;
  }

  public excludeObjectFromSearch(
    graphObject: object
  ): void
  {
    const key = this.retrieveObjectKey(graphObject);
    if (key === undefined)
      throw new Error("graph object not defined");
    this.#excludedObjectKeysForStrongReferences.add(key);
  }

  public obtainSymbolKey(
    graphSymbol: symbol
  ): number
  {
    let key = this.#symbolToReferenceNodeMap.get(graphSymbol);
    if (key === undefined) {
      if (this.#markStrongReferencesStarted)
        throw new Error("readonly state: you've already started marking strong references");

      key = this.#objectAndSymbolKeyCount++;
      this.#symbolToReferenceNodeMap.set(graphSymbol, key);
    }
    return key;
  }

  public getNextParentToChildEdgeId(): number {
    if (this.#markStrongReferencesStarted)
      throw new Error("readonly state: you've already started marking strong references");

    return this.#parentToEdgeIdCount++;
  }

  public addChildToParentEdge(
    childEdge: ChildToParentReferenceGraphEdge
  ): void
  {
    if (this.#markStrongReferencesStarted)
      throw new Error("readonly state: you've already started marking strong references");

    const { childObjectKey, jointOwnerKeys, parentToChildEdgeId } = childEdge;
    const hash = TopDownSearchNumeric.#hashChildToParentEdge(
      childObjectKey, jointOwnerKeys, parentToChildEdgeId
    );
    if (this.#childEdgesMap.has(hash))
      throw new Error("child to parent edge already defined");

    this.#strongChildEdgeTracker.defineChildEdge(
      childEdge.childObjectKey, childEdge.jointOwnerKeys, childEdge.parentToChildEdgeId
    );

    this.#childEdgesMap.set(hash, childEdge);
    this.#writableGraph.childToParentEdges.push(childEdge);
  }

  public addParentToChildEdge(
    parentToChildEdge: ParentToChildReferenceGraphEdge
  ): void
  {
    if (this.#markStrongReferencesStarted)
      throw new Error("readonly state: you've already started marking strong references");

    let innerSet: ParentToChildReferenceGraphEdge[] | undefined = this.#parentKeyToParentEdges.get(parentToChildEdge.parentObjectKey);
    if (!innerSet) {
      innerSet = [];
      this.#parentKeyToParentEdges.set(parentToChildEdge.parentObjectKey, innerSet);
    }

    innerSet.push(parentToChildEdge);
    this.#writableGraph.parentToChildEdges.push(parentToChildEdge);
  }

  public addCollectionToKeyValueEdge(
    collectionEdge: CollectionToKeyValueEdge
  ): void
  {
    if (this.#markStrongReferencesStarted)
      throw new Error("readonly state: you've already started marking strong references");

    this.#writableGraph.collectionToKeyValueEdges.push(collectionEdge);
  }

  public markHeldValuesAsStrongReference(): void {
    if (this.#markStrongReferencesStarted)
      throw new Error("readonly state: you've already started marking strong references");

    if (PRESUMED_HELD_NODE_KEY >= this.referenceGraph.nodes.length) {
      throw new Error("You didn't define the held values key!");
    }
    this.#strongChildEdgeTracker.resolveKey(PRESUMED_HELD_NODE_KEY);
  }

  /** callback from `ChildEdgeReferenceTracker` */
  #strongChildEdgesResolver(
    childKey: number,
    jointOwnerKeys: readonly number[],
    parentToChildEdgeId: number,
  ): void
  {
    const hash = TopDownSearchNumeric.#hashChildToParentEdge(
      childKey, jointOwnerKeys, parentToChildEdgeId
    );
    const childEdge = this.#childEdgesMap.get(hash);
    if (!childEdge)
      throw new Error("internal: how do we not have the child edge?");

    if (this.#excludedObjectKeysForStrongReferences.has(childKey) === false)
      this.#strongReferenceKeys.add(childKey);

    if (childKey === TARGET_NODE_KEY)
      this.#writableGraph.foundTargetValue = true;

    childEdge.isMarkedStrongEdge = true;
  }

  public markStrongReferences(): void {
    if (this.#markStrongReferencesStarted)
      throw new Error("readonly state: you've already started marking strong references");
    this.#markStrongReferencesStarted = true;

    for (const key of this.#strongReferenceKeys) {
      const innerSet: ParentToChildReferenceGraphEdge[] | undefined = this.#parentKeyToParentEdges.get(key);
      if (innerSet === undefined)
        continue;

      for (const parentToChildEdge of innerSet) {
        if (parentToChildEdge.isStrongOwningReference) {
          this.#strongChildEdgeTracker.resolveKey(parentToChildEdge.childObjectKey);
        }
      }
    }

    this.#writableGraph.succeeded = true;
  }
}
