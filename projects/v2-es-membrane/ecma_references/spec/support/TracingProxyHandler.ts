export default
class TracingProxyHandler<T extends object>
implements Required<ProxyHandler<T>>
{
  #counter = 0;
  spy = jasmine.createSpy();

  reset(): void {
    this.#counter = 0;
    this.spy.calls.reset();
  }

  #logTrap<T>(
    trapName: string,
    args: unknown[],
    callback: () => T
  ): T
  {
    const count = this.#counter++;
    this.spy.apply(this, [`${trapName}:start:${count}`, ...args]);
    const result = callback();
    this.spy.apply(this, [`${trapName}:close:${count}`, result]);
    return result;
  }

  apply(target: T, thisArg: unknown, argArray: unknown[]): unknown {
    return this.#logTrap(
      "apply",
      [target, thisArg, argArray],
      () => Reflect.apply(target as CallableFunction, thisArg, argArray) as unknown
    );
  }

  construct(target: T, argArray: unknown[], newTarget: NewableFunction): object {
    return this.#logTrap(
      "construct",
      [target, argArray, newTarget],
      () => Reflect.construct(
        target as new (...args: unknown[]) => object, argArray, newTarget
      ) as object
    );
  }

  defineProperty(target: object, property: string | symbol, attributes: PropertyDescriptor): boolean {
    return this.#logTrap(
      "defineProperty",
      [target, property, attributes],
      () => Reflect.defineProperty(target, property, attributes)
    );
  }

  deleteProperty(target: object, p: string | symbol): boolean {
    return this.#logTrap(
      "deleteProperty",
      [target, p],
      () => Reflect.deleteProperty(target, p)
    );
  }

  get(target: object, p: string | symbol, receiver: unknown): unknown {
    return this.#logTrap(
      "get",
      [target, p, receiver],
      () => Reflect.get(target, p, receiver) as unknown
    );
  }

  getOwnPropertyDescriptor(target: object, p: string | symbol): PropertyDescriptor | undefined {
    return this.#logTrap(
      "getOwnPropertyDescriptor",
      [target, p],
      () => Reflect.getOwnPropertyDescriptor(target, p)
    );
  }

  getPrototypeOf(target: object): object | null {
    return this.#logTrap(
      "getPrototypeOf",
      [target],
      () => Reflect.getPrototypeOf(target)
    );
  }

  has(target: object, p: string | symbol): boolean {
    return this.#logTrap(
      "has",
      [target],
      () => Reflect.has(target, p)
    );
  }

  isExtensible(target: object): boolean {
    return this.#logTrap(
      "isExtensible",
      [target],
      () => Reflect.isExtensible(target)
    );
  }

  ownKeys(target: object): (string | symbol)[] {
    return this.#logTrap(
      "ownKeys",
      [target],
      () => Reflect.ownKeys(target)
    );
  }

  preventExtensions(target: object): boolean {
    return this.#logTrap(
      "preventExtensions",
      [target],
      () => Reflect.preventExtensions(target)
    );
  }

  set(target: object, p: string | symbol, newValue: unknown, receiver: unknown): boolean {
    return this.#logTrap(
      "set",
      [target, p, newValue, receiver],
      () => Reflect.set(target, p, newValue, receiver)
    );
  }

  setPrototypeOf(target: object, v: object | null): boolean {
    return this.#logTrap(
      "setPrototypeOf",
      [target, v],
      () => Reflect.setPrototypeOf(target, v)
    );
  }
}
