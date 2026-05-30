export class ProxyHandlerCanary implements Required<ProxyHandler<object>> {
  apply(target: object, thisArg: unknown, argArray: unknown[]) {
    void target;
    void thisArg;
    void argArray;
    throw new Error("Method not implemented.");
  }
  construct(target: object, argArray: unknown[], newTarget: NewableFunction): object {
    void target;
    void argArray;
    void newTarget;
    throw new Error("Method not implemented.");
  }
  defineProperty(target: object, property: string | symbol, attributes: PropertyDescriptor): boolean {
    void target;
    void property;
    void attributes;
    throw new Error("Method not implemented.");
  }
  deleteProperty(target: object, p: string | symbol): boolean {
    void target;
    void p;
    throw new Error("Method not implemented.");
  }
  get(target: object, p: string | symbol, receiver: unknown) {
    void target;
    void p;
    void receiver;
    throw new Error("Method not implemented.");
  }
  getOwnPropertyDescriptor(target: object, p: string | symbol): PropertyDescriptor | undefined {
    void target;
    void p;
    throw new Error("Method not implemented.");
  }
  getPrototypeOf(target: object): object | null {
    void target;
    throw new Error("Method not implemented.");
  }
  has(target: object, p: string | symbol): boolean {
    void target;
    void p;
    throw new Error("Method not implemented.");
  }
  isExtensible(target: object): boolean {
    void target;
    throw new Error("Method not implemented.");
  }
  ownKeys(target: object): ArrayLike<string | symbol> {
    void target;
    throw new Error("Method not implemented.");
  }
  preventExtensions(target: object): boolean {
    void target;
    throw new Error("Method not implemented.");
  }
  set(target: object, p: string | symbol, newValue: unknown, receiver: unknown): boolean {
    void target;
    void p;
    void newValue;
    void receiver;
    throw new Error("Method not implemented.");
  }
  setPrototypeOf(target: object, v: object | null): boolean {
    void target;
    void v;
    throw new Error("Method not implemented.");
  }
}
