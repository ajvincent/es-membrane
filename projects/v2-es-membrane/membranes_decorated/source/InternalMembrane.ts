import type {
  MembraneIfc
} from "./types/MembraneIfc.js";

import ObjectGraphHead from "#objectgraph_handlers/source/ObjectGraphHead.js";

import type {
  MembraneInternalIfc,
} from "#objectgraph_handlers/source/types/MembraneInternalIfc.js";

import type {
  ObjectGraphHeadIfc,
} from "#objectgraph_handlers/source/types/ObjectGraphHeadIfc.js";

import {
  OneToOneStrongMap,
} from "#stage_utilities/source/collections/OneToOneStrongMap.js";

import {
  ObjectGraphHandler,
} from "./ObjectGraphHandler.js";

import {
  InertObjectGraphHead,
} from "./InertObjectGraphHead.js";

export class InternalMembrane implements MembraneIfc, MembraneInternalIfc {
  readonly #graphHeads = new Map<string | symbol, ObjectGraphHeadIfc>;
  readonly #proxiesOneToOneMap = new OneToOneStrongMap<string | symbol, object>;
  readonly #proxyToSourceKeyMap = new WeakMap<object, string | symbol>;

  // MembraneIfc
  get isRevoked(): boolean {
    return false;
  }

  // MembraneIfc
  createObjectGraph(graphKey: string | symbol): void {
    if (this.#graphHeads.has(graphKey)) {
      throw new Error("Graph already exists!");
    }

    const handler = new ObjectGraphHandler(this, graphKey);
    const head = new ObjectGraphHead(this, handler, this.#proxiesOneToOneMap, graphKey);
    this.#graphHeads.set(graphKey, head);
  }

  // MembraneIfc
  revokeObjectGraph(graphKey: string | symbol): boolean {
    const graphHead = this.#graphHeads.get(graphKey);
    if (!graphHead) {
      throw new Error("no graph by this name exists!");
    }

    return this.#revokeObjectGraph(graphHead);
  }

  #revokeObjectGraph(graphHeadToRevoke: ObjectGraphHeadIfc): boolean {
    if (graphHeadToRevoke.isRevoked)
      return false;

    const graphKey = graphHeadToRevoke.objectGraphKey;
    const allHeads = Array.from(this.#graphHeads.values());

    this.#graphHeads.set(graphKey, new InertObjectGraphHead(graphKey));
    this.#proxiesOneToOneMap.revokeStrongKey(graphKey);
    for (const graphHead of allHeads) {
      graphHead.revokeAllProxiesForGraph(graphKey);
    }

    graphHeadToRevoke.revokeAllProxiesForGraph(graphKey);
    return true;
  }

  // MembraneIfc
  revokeEverything(): void {
    const errors: Error[] = [];
    for (const graphHead of this.#graphHeads.values()) {
      try {
        this.#revokeObjectGraph(graphHead);
      } catch (ex) {
        errors.push(ex as Error);
      }
    }

    if (errors.length)
      throw new AggregateError(errors, "revokeEverything failed");
  }

  #getTargetGraph(
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
  ): ObjectGraphHeadIfc
  {
    const sourceGraph = this.#graphHeads.get(sourceGraphKey);
    if (!sourceGraph)
      throw new Error("unknown source graph!");
    if (sourceGraph.isRevoked)
      throw new Error("revoked source graph!");

    const targetGraph = this.#graphHeads.get(targetGraphKey);
    if (!targetGraph)
      throw new Error("unknown target graph!");
    if (targetGraph.isRevoked)
      throw new Error("revoked target graph!");
    return targetGraph;
  }

  // MembraneIfc
  convertObject<ObjectType extends object>(
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
    value: ObjectType
  ): ObjectType {
    return this.#getTargetGraph(
      sourceGraphKey, targetGraphKey
    ).getValueInGraph(value, sourceGraphKey) as ObjectType;
  }

  // MembraneIfc
  isObjectInGraph(
    graphKey: string | symbol,
    value: object
  ): boolean
  {
    const graph = this.#graphHeads.get(graphKey);
    if (!graph)
      throw new Error("unknown graph!");
    if (graph.isRevoked)
      throw new Error("revoked graph!");
    return this.#proxiesOneToOneMap.hasIdentity(value, graphKey, false);
  }

  // MembraneInternalIfc
  convertValue<ValueType>(
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
    value: ValueType
  ): ValueType
  {
    return this.#getTargetGraph(
      sourceGraphKey, targetGraphKey
    ).getValueInGraph(value, sourceGraphKey) as ValueType;
  }

  // MembraneInternalIfc
  convertArray<
    ValueTypes extends unknown[]
  >
  (
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
    values: ValueTypes
  ): ValueTypes
  {
    return this.#getTargetGraph(
      sourceGraphKey, targetGraphKey
    ).getArrayInGraph(values, sourceGraphKey);
  }

  // MembraneInternalIfc
  convertDescriptor(
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
    sourceDescriptor: PropertyDescriptor | undefined
  ): PropertyDescriptor | undefined
  {
    return this.#getTargetGraph(
      sourceGraphKey, targetGraphKey
    ).getDescriptorInGraph(sourceDescriptor, sourceGraphKey);
  }

  // MembraneInternalIfc
  notifyNewProxy(
    targetProxy: object,
    sourceGraph: string | symbol
  ): void
  {
    this.#proxyToSourceKeyMap.set(targetProxy, sourceGraph);
  }

  // MembraneInternalIfc
  getOriginGraph(
    targetValue: object
  ): string | symbol | undefined
  {
    return this.#proxyToSourceKeyMap.get(targetValue);
  }

  // MembraneInternalIfc
  isGraphRevoked(
    graphKey: string | symbol
  ): boolean
  {
    const graphHead = this.#graphHeads.get(graphKey);
    if (!graphHead)
      throw new Error("unknown graph");

    return graphHead.isRevoked;
  }

  // MembraneInternalIfc
  notifyAssertionFailed(
    targetGraphKey: string | symbol
  ): void
  {
    for (const graphHead of this.#graphHeads.values()) {
      graphHead.revokeAllProxiesForGraph(targetGraphKey);
      this.#graphHeads.set(graphHead.objectGraphKey, new InertObjectGraphHead(graphHead.objectGraphKey));
    }
  }
}
