import {
  DefaultWeakMap
} from "./DefaultMap.js";

export type RequiredState = "initial" | "adding" | "resolving" | "ready" | "checkFired";
export interface RequiredInitializersInterface {
  getState() : RequiredState;
  add(key: string): void;
  has(key: string) : boolean;
  resolve(key: string): void;
  check(): void;
}

/** @internal */
class RequiredInitializers implements RequiredInitializersInterface
{
  // #region private
  #requiredInitializers = new Set<string>;
  #state: RequiredState = "initial";

  #setState(allowedPrevious: RequiredState, assertCurrent: RequiredState) : void
  {
    if (this.#state === allowedPrevious)
      this.#state = assertCurrent;
    else if (this.#state !== assertCurrent)
      throw new Error(`RequiredInitializers state mismatch: expected ${allowedPrevious} or ${assertCurrent}, found ${this.#state}`);
  }
  // #endregion private

  getState() : RequiredState
  {
    return this.#state;
  }

  add(key: string) : void
  {
    this.#setState("initial", "adding");
    if (this.#requiredInitializers.has(key))
      throw new Error("key already required");
    this.#requiredInitializers.add(key);
  }

  has(key: string) : boolean
  {
    return this.#requiredInitializers.has(key);
  }

  mayResolve(key: string) : void {
    if (!this.#requiredInitializers.has(key))
      throw new Error("unknown or already resolved initializer key: " + key);
  }

  resolve(key: string) : void
  {
    this.mayResolve(key);

    this.#setState("adding", "resolving");
    this.#requiredInitializers.delete(key);

    if (this.#requiredInitializers.size === 0)
      this.#state = "ready";
  }

  check() : void
  {
    this.#setState("ready", "checkFired");
  }
}

const initializersMap = new DefaultWeakMap<object, RequiredInitializers>;

export default function getRequiredInitializers(instance: object): RequiredInitializers {
  return initializersMap.getDefault(instance, () => new RequiredInitializers);
}
