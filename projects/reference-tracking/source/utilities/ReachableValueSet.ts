import SyncPromise, {
  type SyncPromiseWithResolvers
} from "./SyncPromise.js";

export class ReachableValueSet {
  readonly #keyToPromiseMap = new Map<number, SyncPromiseWithResolvers<void>>;

  public hasKey(key: number): boolean {
    return this.#keyToPromiseMap.has(key);
  }

  public defineKeyResolver(
    key: number,
    callback: (this: void) => void,
  ): void
  {
    if (this.#keyToPromiseMap.has(key))
      throw new Error("reachable value already defined for key " + key);
    const promiseAndResolver = SyncPromise.withResolver<void>();
    this.#keyToPromiseMap.set(key, promiseAndResolver);
    promiseAndResolver.promise.thenNoChain(callback);
  }

  public keyDependsOnJointOwners(
    childKey: number,
    jointOwnerKeys: readonly number[],
    callback?: (
      this: void,
      childKey: number,
      jointOwnerKeys: readonly number[]
    ) => void,
  ): void
  {
    for (const ownerKey of jointOwnerKeys) {
      if (!this.#keyToPromiseMap.has(ownerKey))
        throw new Error("no reachable value defined for owner key " + ownerKey);
    }
    if (!this.#keyToPromiseMap.has(childKey))
      throw new Error("no reachable value defined for child key " + childKey);

    const promises: SyncPromise<void>[] = jointOwnerKeys.map(
      key => this.#keyToPromiseMap.get(key)!.promise
    );

    const allPromise = SyncPromise.all(promises);
    allPromise.thenNoChain(() => this.resolveKey(childKey));

    if (callback) {
      jointOwnerKeys = jointOwnerKeys.slice();
      allPromise.thenNoChain(() => callback(childKey, jointOwnerKeys));
    }
  }

  public isKeyResolved(
    ownerKey: number
  ): boolean
  {
    const promiseAndResolver = this.#keyToPromiseMap.get(ownerKey);
    if (!promiseAndResolver)
      throw new Error("no reachable value found for key " + ownerKey);

    return promiseAndResolver.promise.isResolved;
  }

  public resolveKey(
    ownerKey: number
  ): void
  {
    const promiseAndResolver = this.#keyToPromiseMap.get(ownerKey);
    if (!promiseAndResolver)
      throw new Error("no reachable value found for key " + ownerKey);

    promiseAndResolver.resolve();
  }
}
