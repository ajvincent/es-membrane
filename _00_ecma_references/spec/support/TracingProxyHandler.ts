interface TracingSpy {
  spy: jasmine.Spy
};

export default
class TracingProxyHandler<T extends object>
implements Required<ProxyHandler<T>>, TracingSpy
{
  spy = jasmine.createSpy();

  apply(target: T, thisArg: any, argArray: any[]) {
    let result = Reflect.apply(target as CallableFunction, thisArg, argArray);
    this.spy.apply(this, ["apply", ...arguments, result]);
    return result;
  }

  construct(target: T, argArray: any[], newTarget: Function): object {
    let result = Reflect.construct(target as new (...args: unknown[]) => object, argArray, newTarget);
    this.spy.apply(this, ["construct", ...arguments, result]);
    return result;
  }

  defineProperty(target: object, property: string | symbol, attributes: PropertyDescriptor): boolean {
    let result = Reflect.defineProperty(target, property, attributes);
    this.spy.apply(this, ["defineProperty", ...arguments, result]);
    return result;
  }

  deleteProperty(target: object, p: string | symbol): boolean {
    let result = Reflect.deleteProperty(target, p);
    this.spy.apply(this, ["deleteProperty", ...arguments, result]);
    return result;
  }

  get(target: object, p: string | symbol, receiver: any) {
    let result = Reflect.get(target, p, receiver);
    this.spy.apply(this, ["get", ...arguments, result]);
    return result;
  }

  getOwnPropertyDescriptor(target: object, p: string | symbol): PropertyDescriptor | undefined {
    let result = Reflect.getOwnPropertyDescriptor(target, p);
    this.spy.apply(this, ["getOwnPropertyDescriptor", ...arguments, result]);
    return result;
  }

  getPrototypeOf(target: object): object | null {
    let result = Reflect.getPrototypeOf(target);
    this.spy.apply(this, ["getPrototypeOf", ...arguments, result]);
    return result;
  }

  has(target: object, p: string | symbol): boolean {
    let result = Reflect.has(target, p);
    this.spy.apply(this, ["has", ...arguments, result]);
    return result;
  }

  isExtensible(target: object): boolean {
    let result = Reflect.isExtensible(target);
    this.spy.apply(this, ["isExtensible", ...arguments, result]);
    return result;
  }

  ownKeys(target: object): ArrayLike<string | symbol> {
    let result = Reflect.ownKeys(target);
    this.spy.apply(this, ["ownKeys", ...arguments, result]);
    return result;
  }

  preventExtensions(target: object): boolean {
    let result = Reflect.preventExtensions(target);
    this.spy.apply(this, ["preventExtensions", ...arguments, result]);
    return result;
  }

  set(target: object, p: string | symbol, newValue: any, receiver: any): boolean {
    let result = Reflect.set(target, p, newValue, receiver);
    this.spy.apply(this, ["set", ...arguments, result]);
    return result;
  }

  setPrototypeOf(target: object, v: object | null): boolean {
    let result = Reflect.setPrototypeOf(target, v);
    this.spy.apply(this, ["setPrototypeOf", ...arguments, result]);
    return result;
  }
}
