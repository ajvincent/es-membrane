/** Updates the shadow target in accordance with ECMAScript invariants. */
export class UpdatingProxyHandler<T extends object> implements Required<ProxyHandler<T>> {
  static readonly #undefinedDescriptor = Object.freeze({
    value: undefined,
    writable: true,
    enumerable: true,
    configurable: true,
  });

  readonly #actualTarget: T;
  constructor(actualTarget: T) {
    this.#actualTarget = actualTarget;
  }

  // apply and construct traps do not need to modify the shadow target.

  public apply(target: T, thisArg: unknown, argArray: unknown[]): void {
    if (typeof this.#actualTarget !== "function")
      throw new Error("actual target isn't a function");
    void target;
    return Reflect.apply(this.#actualTarget, thisArg, argArray);
  }

  public construct(target: T, argArray: unknown[], newTarget: NewableFunction): object {
    if (typeof this.#actualTarget !== "function")
      throw new Error("actual target isn't a function");
    void target;
    return Reflect.construct(this.#actualTarget, argArray, newTarget) as object;
  }

  public defineProperty(target: T, property: string | symbol, attributes: PropertyDescriptor): boolean {
    let result: boolean = Reflect.defineProperty(this.#actualTarget, property, attributes);
    if (result)
      result = Reflect.defineProperty(target, property, attributes);
    return result;
  }

  public deleteProperty(target: T, p: string | symbol): boolean {
    let result: boolean = Reflect.deleteProperty(this.#actualTarget, p);
    if (result)
      result = Reflect.deleteProperty(target, p);
    return result;
  }

  public get(target: T, p: string | symbol, receiver: unknown) {
    // https://tc39.es/ecma262/#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver
    // beware the invariants
    void target;
    return Reflect.get(this.#actualTarget, p, receiver);
  }

  public getOwnPropertyDescriptor(target: T, p: string | symbol): PropertyDescriptor | undefined {
    const desc = Reflect.getOwnPropertyDescriptor(this.#actualTarget, p);

    // these operations may fail, which is why we call getOwnPropertyDescriptor at the end
    if (desc)
      Reflect.defineProperty(target, p, desc);
    else
      Reflect.deleteProperty(target, p);

    return Reflect.getOwnPropertyDescriptor(target, p);
  }

  public getPrototypeOf(target: T): object | null {
    const proto = Reflect.getPrototypeOf(this.#actualTarget);
    // this operation may fail, so we result in getPrototypeOf from the target.
    Reflect.setPrototypeOf(target, proto);
    return Reflect.getPrototypeOf(target);
  }

  public has(target: T, p: string | symbol): boolean {
    // https://tc39.es/ecma262/#sec-proxy-object-internal-methods-and-internal-slots-hasproperty-p
    // beware the invariants
    void target;
    return Reflect.has(this.#actualTarget, p);
  }

  public isExtensible(target: T): boolean {
    if (Reflect.isExtensible(target) === false)
      return false;

    const result = Reflect.isExtensible(this.#actualTarget);
    if (result === false)
      this.#lockShadowTarget(target);
    return result;
  }

  public ownKeys(target: T): (string | symbol)[] {
    if (Reflect.isExtensible(target) === false)
      return Reflect.ownKeys(target);

    const result = Reflect.ownKeys(this.#actualTarget);

    const returnedKeys = new Set<string | symbol>(result);
    const shadowKeys = new Set<string | symbol>(Reflect.ownKeys(target));

    const addedKeys = returnedKeys.difference(shadowKeys);
    const removedKeys = shadowKeys.difference(returnedKeys);

    for (const key of removedKeys) {
      Reflect.deleteProperty(target, key);
    }

    for (const key of addedKeys) {
      Reflect.defineProperty(target, key, UpdatingProxyHandler.#undefinedDescriptor);
    }

    return result;
  }

  public preventExtensions(target: T): boolean {
    if (Reflect.isExtensible(target) === false)
      return false;

    const result = Reflect.preventExtensions(this.#actualTarget);
    if (result)
      this.#lockShadowTarget(target);
    return result;
  }

  public set(target: T, p: string | symbol, newValue: unknown, receiver: unknown): boolean {
    // https://tc39.es/ecma262/#sec-proxy-object-internal-methods-and-internal-slots-set-p-v-receiver
    // beware the invariants
    void target;
    return Reflect.set(this.#actualTarget, p, newValue, receiver);
  }

  public setPrototypeOf(target: T, v: object | null): boolean {
    let result: boolean = Reflect.setPrototypeOf(this.#actualTarget, v);
    if (result)
      result = Reflect.setPrototypeOf(target, v);
    return result;
  }

  #lockShadowTarget(
    shadowTarget: T,
  ): void
  {
    const keys: (string | symbol)[] = this.ownKeys(shadowTarget);
    keys.forEach(key => {
      // this will update the properties for us
      this.getOwnPropertyDescriptor(shadowTarget, key);
    });

    void this.getPrototypeOf(shadowTarget);
    Reflect.preventExtensions(shadowTarget);
  }
}
