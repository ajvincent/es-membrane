import {
  GuestEngine
} from "./GuestEngine.js";

import type {
  RealmDriver
} from "./runInRealm.js";

export class RealmHostDefined {
  readonly #driver: RealmDriver;

  readonly pendingHostPromises = new Set<Promise<void>>;

  constructor(outer: RealmDriver) {
    this.#driver = outer;
  }

  public promiseRejectionTracker(
    promise: GuestEngine.PromiseObjectValue,
    operation: "reject" | "handle"
  ): void {
    switch (operation) {
      case 'reject':
        this.#driver.trackedPromises.add(promise);
        break;
      case 'handle':
        this.#driver.trackedPromises.delete(promise);
        break;
    }
  }

  /*
  public getImportMetaProperties(...args: unknown[]): unknown {
  }
 
  public finalizeImportMeta(...args: unknown[]): unknown {
  }
 
  get public(): never {
    throw new Error("what is this?");
  }
 
  get specifier(): never {
    throw new Error("what should this be?");
  }
  */
  public readonly randomSeed: undefined;
}
