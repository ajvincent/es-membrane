interface TracingSpy {
  spy: jasmine.Spy
};

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

  #logTrap<T extends unknown>(
    trapName: string,
    args: unknown[],
    callback: () => T
  ): T
  {
    let count = this.#counter++;
    this.spy.apply(this, [`${trapName}:start:${count}`, ...args]);
    let result = callback();
    this.spy.apply(this, [`${trapName}:close:${count}`, result]);
    return result;
  }

  apply(target: T, thisArg: any, argArray: any[]) {
    return this.#logTrap(
      "apply",
      Array.from(arguments),
      () => Reflect.apply(target as CallableFunction, thisArg, argArray)
    );
  }

  construct(target: T, argArray: any[], newTarget: Function): object {
    return this.#logTrap(
      "construct",
      Array.from(arguments),
      () => Reflect.construct(target as new (...args: unknown[]) => object, argArray, newTarget)
    );
  }

  defineProperty(target: object, property: string | symbol, attributes: PropertyDescriptor): boolean {
    return this.#logTrap(
      "defineProperty",
      Array.from(arguments),
      () => Reflect.defineProperty(target, property, attributes)
    );
  }

  deleteProperty(target: object, p: string | symbol): boolean {
    return this.#logTrap(
      "deleteProperty",
      Array.from(arguments),
      () => Reflect.deleteProperty(target, p)
    );
  }

  get(target: object, p: string | symbol, receiver: any) {
    return this.#logTrap(
      "get",
      Array.from(arguments),
      () => Reflect.get(target, p, receiver)
    );
  }

  getOwnPropertyDescriptor(target: object, p: string | symbol): PropertyDescriptor | undefined {
    return this.#logTrap(
      "getOwnPropertyDescriptor",
      Array.from(arguments),
      () => Reflect.getOwnPropertyDescriptor(target, p)
    );
  }

  getPrototypeOf(target: object): object | null {
    return this.#logTrap(
      "getPrototypeOf",
      Array.from(arguments),
      () => Reflect.getPrototypeOf(target)
    );
  }

  has(target: object, p: string | symbol): boolean {
    return this.#logTrap(
      "has",
      Array.from(arguments),
      () => Reflect.has(target, p)
    );
  }

  isExtensible(target: object): boolean {
    return this.#logTrap(
      "isExtensible",
      Array.from(arguments),
      () => Reflect.isExtensible(target)
    );
  }

  ownKeys(target: object): ArrayLike<string | symbol> {
    return this.#logTrap(
      "ownKeys",
      Array.from(arguments),
      () => Reflect.ownKeys(target)
    );
  }

  preventExtensions(target: object): boolean {
    return this.#logTrap(
      "preventExtensions",
      Array.from(arguments),
      () => Reflect.preventExtensions(target)
    );
  }

  set(target: object, p: string | symbol, newValue: any, receiver: any): boolean {
    return this.#logTrap(
      "set",
      Array.from(arguments),
      () => Reflect.set(target, p, newValue, receiver)
    );
  }

  setPrototypeOf(target: object, v: object | null): boolean {
    return this.#logTrap(
      "setPrototypeOf",
      Array.from(arguments),
      () => Reflect.setPrototypeOf(target, v)
    );
  }
}
