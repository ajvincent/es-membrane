import type {
  MembraneIfc
} from "./types/MembraneIfc.js";

import {
  InertMembrane
} from "./InertMembrane.js";

import {
  InternalMembrane
} from "./InternalMembrane.js";

export class Membrane implements MembraneIfc
{
  #internal: MembraneIfc = new InternalMembrane;

  #requireNotRevoked(): void {
    if (this.#internal === undefined)
      throw new Error("Membrane has been revoked!");
  }

  get isRevoked(): boolean {
    return this.#internal === undefined;
  }

  createObjectGraph(
    graphKey: string | symbol
  ): void
  {
    this.#requireNotRevoked();
    this.#internal.createObjectGraph(graphKey);
  }

  revokeObjectGraph(
    graphKey: string | symbol
  ): boolean
  {
    this.#requireNotRevoked();
    return this.#internal.revokeObjectGraph(graphKey);
  }

  revokeEverything(): void {
    this.#requireNotRevoked();
    const internalMembrane = this.#internal;
    this.#internal = new InertMembrane;
    internalMembrane.revokeEverything();
  }

  convertObject<
    ObjectType extends object
  >
  (
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
    value: ObjectType
  ): ObjectType
  {
    this.#requireNotRevoked();
    return this.#internal.convertObject<ObjectType>(sourceGraphKey, targetGraphKey, value);
  }
}
