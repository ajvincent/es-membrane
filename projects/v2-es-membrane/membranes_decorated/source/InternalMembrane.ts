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

  get isRevoked(): boolean {
    return false;
  }

  createObjectGraph(graphKey: string | symbol): void {
    if (this.#graphHeads.has(graphKey)) {
      throw new Error("Graph already exists!");
    }

    const handler = new ObjectGraphHandler(this, graphKey);
    const head = new ObjectGraphHead(this, handler, this.#proxiesOneToOneMap, graphKey);
    this.#graphHeads.set(graphKey, head);
  }

  revokeObjectGraph(graphKey: string | symbol): boolean {
    const graphHead = this.#graphHeads.get(graphKey);
    if (!graphHead) {
      throw new Error("no graph by this name exists!");
    }
    if (graphHead.isRevoked)
      return false;
    this.#graphHeads.set(graphKey, new InertObjectGraphHead(graphKey));

    graphHead.revokeAllProxiesForGraph(graphKey);
    return true;
  }

  revokeEverything(): void {
    for (const [graphKey, graphHead] of this.#graphHeads.entries()) {
      graphHead.revokeAllProxiesForGraph(graphKey);
      this.#graphHeads.set(graphKey, new InertObjectGraphHead(graphKey));
    }
  }

  #getTargetGraph(
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol
  ): ObjectGraphHeadIfc
  {
    if (!this.#graphHeads.has(sourceGraphKey))
      throw new Error("unknown source graph!");

    const targetGraph = this.#graphHeads.get(targetGraphKey);
    if (!targetGraph)
      throw new Error("unknown target graph!");
    return targetGraph;
  }

  convertObject<ObjectType extends object>(
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
    value: ObjectType
  ): ObjectType {
    return this.#getTargetGraph(
      sourceGraphKey, targetGraphKey
    ).getValueInGraph(value, sourceGraphKey) as ObjectType;
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
