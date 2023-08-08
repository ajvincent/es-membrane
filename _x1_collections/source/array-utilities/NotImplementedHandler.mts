/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

export default class NotImplementedProxyHandler
implements Required<ProxyHandler<object>>
{
  apply(target: object, thisArg: any, argArray: any[]): any {
    throw new Error("Method not implemented.");
  }
  construct(target: object, argArray: any[], newTarget: Function): object {
    throw new Error("Method not implemented.");
  }
  defineProperty(target: object, property: string | symbol, attributes: PropertyDescriptor): boolean {
    throw new Error("Method not implemented.");
  }
  deleteProperty(target: object, p: string | symbol): boolean {
    throw new Error("Method not implemented.");
  }
  get(target: object, p: string | symbol, receiver: any): any {
    throw new Error("Method not implemented.");
  }
  getOwnPropertyDescriptor(target: object, p: string | symbol): PropertyDescriptor | undefined {
    throw new Error("Method not implemented.");
  }
  getPrototypeOf(target: object): object | null {
    throw new Error("Method not implemented.");
  }
  has(target: object, p: string | symbol): boolean {
    throw new Error("Method not implemented.");
  }
  isExtensible(target: object): boolean {
    throw new Error("Method not implemented.");
  }
  ownKeys(target: object): ArrayLike<string | symbol> {
    throw new Error("Method not implemented.");
  }
  preventExtensions(target: object): boolean {
    throw new Error("Method not implemented.");
  }
  set(target: object, p: string | symbol, newValue: any, receiver: any): boolean {
    throw new Error("Method not implemented.");
  }
  setPrototypeOf(target: object, v: object | null): boolean {
    throw new Error("Method not implemented.");
  }
}
