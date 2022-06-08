import type { ShadowProxyHandler } from "./ShadowProxyHandler.mjs";
import type { ObjectGraphStub } from "./ObjectGraphStub.mjs";
export default class HeadHandler<T extends object> implements Required<ProxyHandler<T>> {
    #private;
    constructor(shadowHandler: ShadowProxyHandler<T>, currentGraph: ObjectGraphStub<T>, targetGraph: ObjectGraphStub<T>);
    apply(shadowTarget: T, thisArg: unknown, argArray: unknown[]): unknown;
    construct(shadowTarget: T, argArray: unknown[], newTarget: Function): object;
    defineProperty(shadowTarget: T, p: string | symbol, attributes: PropertyDescriptor): boolean;
    deleteProperty(shadowTarget: T, p: string | symbol): boolean;
    get(shadowTarget: T, p: string | symbol, receiver: unknown): unknown;
    getOwnPropertyDescriptor(shadowTarget: T, p: string | symbol): PropertyDescriptor | undefined;
    getPrototypeOf(shadowTarget: T): object | null;
    has(shadowTarget: T, p: string | symbol): boolean;
    isExtensible(shadowTarget: T): boolean;
    ownKeys(shadowTarget: T): ArrayLike<string | symbol>;
    preventExtensions(shadowTarget: T): boolean;
    set(shadowTarget: T, p: string | symbol, value: unknown, receiver: unknown): boolean;
    setPrototypeOf(shadowTarget: T, proto: object | null): boolean;
}
