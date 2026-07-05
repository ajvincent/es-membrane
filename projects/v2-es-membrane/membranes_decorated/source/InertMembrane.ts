import type {
  MembraneIfc
} from "./types/MembraneIfc.js";

export class InertMembrane implements MembraneIfc {
  get isRevoked(): boolean {
    return true;
  }

  createObjectGraph(graphKey: string | symbol): void {
    void graphKey;
    throw new Error("Method not implemented.");
  }

  revokeObjectGraph(graphKey: string | symbol): boolean {
    void graphKey;
    throw new Error("Method not implemented.");
  }

  revokeEverything(): void {
    throw new Error("Method not implemented.");
  }

  convertObject<ObjectType extends object>(
    sourceGraphKey: string | symbol,
    targetGraphKey: string | symbol,
    sourceValue: ObjectType): ObjectType
  {
    void sourceGraphKey;
    void targetGraphKey;
    void sourceValue;
    throw new Error("Method not implemented.");
  }

  isObjectInGraph(graphKey: string | symbol, value: object): boolean {
    void graphKey;
    void value;
    throw new Error("Method not implemented.");
  }
}
