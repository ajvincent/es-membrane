import type { propertyKey } from "../../_02_membrane_utilities/source/publicUtilities.mjs";
import type { ShadowProxyHandler } from "./ShadowProxyHandler.mjs";

export default class TailHandler<T extends object> implements ShadowProxyHandler<T>
{
    apply(
        shadowTarget: T,
        thisArg: unknown,
        argArray: unknown[],
        
        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>,
        
        nextThisArg: unknown,
        nextArgArray: unknown[]
    ): unknown
    {
        void(shadowTarget);
        void(thisArg);
        void(argArray);
        return nextHandler.apply(nextTarget, nextThisArg, nextArgArray);
    }

    construct(
        shadowTarget: T,
        argArray: unknown[],
        newTarget: Function,
        
        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>,

        nextArgArray: unknown[],
        nextNewTarget: Function
    ): object
    {
        void(shadowTarget);
        void(argArray);
        void(newTarget);
        return nextHandler.construct(nextTarget, nextArgArray, nextNewTarget);
    }

    defineProperty(
        shadowTarget: T,
        p: propertyKey,
        attributes: PropertyDescriptor,
        
        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>,
        
        nextAttributes: PropertyDescriptor
    ): boolean
    {
        void(shadowTarget);
        void(attributes);
        return nextHandler.defineProperty(nextTarget, p, nextAttributes);
    }

    deleteProperty(
        shadowTarget: T,
        p: propertyKey,
        
        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>
    ): boolean
    {
        void(shadowTarget);
        return nextHandler.deleteProperty(nextTarget, p);
    }

    get(
        shadowTarget: T,
        p: propertyKey,
        receiver: unknown,

        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>,
        nextReceiver: unknown
    ): unknown
    {
        void(shadowTarget);
        void(receiver);
        return nextHandler.get(nextTarget, p, nextReceiver);
    }

    getOwnPropertyDescriptor(
        shadowTarget: T,
        p: propertyKey,

        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>
    ): PropertyDescriptor | undefined
    {
        void(shadowTarget);
        return nextHandler.getOwnPropertyDescriptor(nextTarget, p);
    }

    getPrototypeOf(
        shadowTarget: T,

        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>
    ): object | null
    {
        void(shadowTarget);
        return nextHandler.getPrototypeOf(nextTarget);
    }

    has(
        shadowTarget: T,
        p: propertyKey,

        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>
    ): boolean
    {
        void(shadowTarget);
        return nextHandler.has(nextTarget, p);
    }

    isExtensible(
        shadowTarget: T,
        
        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>
    ): boolean
    {
        void(shadowTarget);
        return nextHandler.isExtensible(nextTarget);
    }

    ownKeys(
        shadowTarget: T,

        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>
    ) : ArrayLike<propertyKey>
    {
        void(shadowTarget);
        return nextHandler.ownKeys(nextTarget);
    }

    preventExtensions(
        shadowTarget: T,
        
        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>
    ): boolean
    {
        void(shadowTarget);
        return nextHandler.preventExtensions(nextTarget);
    }

    set(
        shadowTarget: T,
        p: propertyKey,
        value: unknown,
        receiver: unknown,

        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>,

        nextValue: unknown,
        nextReceiver: unknown
    ): boolean
    {
        void(shadowTarget);
        void(value);
        void(receiver);
        return nextHandler.set(nextTarget, p, nextValue, nextReceiver);
    }

    setPrototypeOf(
        shadowTarget: T,
        proto: object | null,

        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>,
        
        nextProto: object | null
    ): boolean
    {
        void(shadowTarget);
        void(proto);
        return nextHandler.setPrototypeOf(nextTarget, nextProto);
    }
}
