import MixinBase from "./MixinBase.mjs";

export type RequiredState = "initial" | "adding" | "resolving" | "ready" | "checkFired";
export interface RequiredInitializersInterface {
  getState() : RequiredState;
  add(key: string): void;
  has(key: string) : boolean;
  resolve(key: string): void;
  check(): void;
}

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

  resolve(key: string) : void
  {
    if (!this.#requiredInitializers.has(key))
      throw new Error("unknown or already resolved initializer key: " + key);

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

export default class MixinRequiredInitializers extends MixinBase
{
  protected readonly initializerFlags = new RequiredInitializers;
}
Object.freeze(MixinRequiredInitializers.prototype);
