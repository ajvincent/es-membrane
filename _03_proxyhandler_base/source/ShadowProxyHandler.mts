const ReflectHandler: Required<ProxyHandler<object>> = Reflect;

type ShadowProxyHandler<T extends object> =
{
    apply(
        shadowTarget: T,
        thisArg: unknown,
        argArray: unknown[],

        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>,

        nextThisArg: unknown,
        nextArgArray: unknown[]
    ): unknown;

    construct(
        shadowTarget: T,
        argArray: unknown[],
        newTarget: Function,

        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>,

        nextArgArray: unknown[],
        nextNewTarget: Function
    ): object;

    defineProperty(
        shadowTarget: T,
        p: string | symbol,
        attributes: PropertyDescriptor,

        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>,

        nextAttributes: PropertyDescriptor
    ): boolean;

    deleteProperty(
        shadowTarget: T,
        p: string | symbol,

        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>
    ): boolean;

    get(
        shadowTarget: T,
        p: string | symbol,
        receiver: unknown,
        
        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>,
        
        nextReceiver: unknown
    ): unknown;

    getOwnPropertyDescriptor(
        shadowTarget: T,
        p: string | symbol,

        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>
    ): PropertyDescriptor | undefined;

    getPrototypeOf(
        shadowTarget: T,

        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>
    ): object | null;

    has(
        shadowTarget: T,
        p: string | symbol,
        
        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>
    ): boolean;

    isExtensible(
        shadowTarget: T,

        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>
    ): boolean;

    ownKeys(
        shadowTarget: T,

        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>
    ): ArrayLike<string | symbol>;

    preventExtensions(
        shadowTarget: T,
        
        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>
    ): boolean;

    set(
        shadowTarget: T,
        p: string | symbol,
        value: unknown,
        receiver: unknown,

        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>,

        nextValue: unknown,
        nextReceiver: unknown
    ): boolean;

    setPrototypeOf(
        shadowTarget: T,
        proto: object | null,

        nextTarget: T,
        nextHandler: Required<ProxyHandler<T>>,

        nextProto: object | null
    ): boolean;
}

export { ShadowProxyHandler, ReflectHandler };
