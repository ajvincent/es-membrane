import type {
  MembraneIfc
} from "./types/MembraneIfc.js";

import ObjectGraphHead from "#objectgraph_handlers/source/ObjectGraphHead.js";

import type { MembraneInternalIfc } from "#objectgraph_handlers/source/types/MembraneInternalIfc.js";

import type { ObjectGraphHeadIfc } from "#objectgraph_handlers/source/types/ObjectGraphHeadIfc.js";

import { OneToOneStrongMap } from "#stage_utilities/source/collections/OneToOneStrongMap.js";

import { ObjectGraphHandler } from "./ObjectGraphHandler.js";

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

    graphHead.revokeAllProxiesForGraph(graphKey);
    return true;
  }

  revokeEverything(): void {
    for (const [graphKey, graphHead] of this.#graphHeads.entries()) {
      graphHead.revokeAllProxiesForGraph(graphKey);
    }
  }

  convertObject<ObjectType extends object>(
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
    value: ObjectType
  ): ObjectType {
    if (!this.#graphHeads.has(sourceGraphKey))
      throw new Error("unknown source graph!");
    const targetGraph = this.#graphHeads.get(targetGraphKey);
    if (!targetGraph)
      throw new Error("unknown target graph!");
    return targetGraph.getValueInGraph(value, sourceGraphKey) as ObjectType;
  }

  // MembraneInternalIfc
  convertArray<
    ValueTypes extends unknown[]
  >(
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
    values: ValueTypes
  ): ValueTypes {
    void sourceGraphKey;
    void targetGraphKey;
    void values;
    throw new Error("Method not implemented.");
  }

  // MembraneInternalIfc
  convertDescriptor(
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
    descriptor: PropertyDescriptor | undefined
  ): PropertyDescriptor | undefined {
    void sourceGraphKey;
    void targetGraphKey;
    void descriptor;
    throw new Error("Method not implemented.");
  }

  // MembraneInternalIfc
  notifyAssertionFailed(
    targetGraphKey: string | symbol
  ): void {
    for (const graphHead of this.#graphHeads.values()) {
      graphHead.revokeAllProxiesForGraph(targetGraphKey);
    }
  }
}
