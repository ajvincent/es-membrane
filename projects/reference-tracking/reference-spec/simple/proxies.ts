/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
const NotImplementedProxyHandler:  Required<ProxyHandler<object>> =
{
  apply(target: object, thisArg: any, argArray: any[]): any {
    throw new Error("Method not implemented.");
  },
  construct(target: object, argArray: any[], newTarget: Function): object {
    throw new Error("Method not implemented.");
  },
  defineProperty(target: object, property: string | symbol, attributes: PropertyDescriptor): boolean {
    throw new Error("Method not implemented.");
  },
  deleteProperty(target: object, p: string | symbol): boolean {
    throw new Error("Method not implemented.");
  },
  get(target: object, p: string | symbol, receiver: any): any {
    throw new Error("Method not implemented.");
  },
  getOwnPropertyDescriptor(target: object, p: string | symbol): PropertyDescriptor | undefined {
    throw new Error("Method not implemented.");
  },
  getPrototypeOf(target: object): object | null {
    throw new Error("Method not implemented.");
  },
  has(target: object, p: string | symbol): boolean {
    throw new Error("Method not implemented.");
  },
  isExtensible(target: object): boolean {
    throw new Error("Method not implemented.");
  },
  ownKeys(target: object): ArrayLike<string | symbol> {
    throw new Error("Method not implemented.");
  },
  preventExtensions(target: object): boolean {
    throw new Error("Method not implemented.");
  },
  set(target: object, p: string | symbol, newValue: any, receiver: any): boolean {
    throw new Error("Method not implemented.");
  },
  setPrototypeOf(target: object, v: object | null): boolean {
    throw new Error("Method not implemented.");
  },
}

const shadowTarget: object = {};
const { proxy, revoke } = Proxy.revocable(shadowTarget, NotImplementedProxyHandler);

searchReferences("shadow target held before revocation", shadowTarget, [revoke], true);
searchReferences("proxy handler held before revocation", NotImplementedProxyHandler, [revoke], true);
searchReferences("proxy held before revocation", proxy, [revoke], true);
searchReferences("revoke held by proxy", revoke, [proxy], true);

revoke();

searchReferences("shadow target held by revoker after revocation", shadowTarget, [revoke], true);
searchReferences("proxy handler held by revoker after revocation", NotImplementedProxyHandler, [revoke], true);
searchReferences("shadow target held by proxy after revocation", shadowTarget, [proxy], true);
searchReferences("proxy handler held by proxy after revocation", NotImplementedProxyHandler, [proxy], true);
searchReferences("proxy held after revocation", proxy, [revoke], true);
