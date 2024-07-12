// This file is generated.  Do not edit.

export default class ForwardToReflect<T extends object> implements ProxyHandler<T> {
    /**
     * A trap method for a function call.
     * @param target The original callable object which is being proxied.
     */
    public apply(target: T, thisArg: any, argArray: any[]): any {
        return Reflect.apply(target as CallableFunction, thisArg, argArray);
    }

    /**
     * A trap for the `new` operator.
     * @param target The original object which is being proxied.
     * @param newTarget The constructor that was originally called.
     */
    public construct(target: T, argArray: any[], newTarget: Function): object {
        return Reflect.construct(target as NewableFunction, argArray, newTarget);
    }

    /**
     * A trap for `Object.defineProperty()`.
     * @param target The original object which is being proxied.
     * @returns A `Boolean` indicating whether or not the property has been defined.
     */
    public defineProperty(target: T, property: string | symbol, attributes: PropertyDescriptor): boolean {
        return Reflect.defineProperty(target, property, attributes);
    }

    /**
     * A trap for the `delete` operator.
     * @param target The original object which is being proxied.
     * @param p The name or `Symbol` of the property to delete.
     * @returns A `Boolean` indicating whether or not the property was deleted.
     */
    public deleteProperty(target: T, p: string | symbol): boolean {
        return Reflect.deleteProperty(target, p);
    }

    /**
     * A trap for getting a property value.
     * @param target The original object which is being proxied.
     * @param p The name or `Symbol` of the property to get.
     * @param receiver The proxy or an object that inherits from the proxy.
     */
    public get(target: T, p: string | symbol, receiver: any): any {
        return Reflect.get(target, p, receiver);
    }

    /**
     * A trap for `Object.getOwnPropertyDescriptor()`.
     * @param target The original object which is being proxied.
     * @param p The name of the property whose description should be retrieved.
     */
    public getOwnPropertyDescriptor(target: T, p: string | symbol): PropertyDescriptor | undefined {
        return Reflect.getOwnPropertyDescriptor(target, p);
    }

    /**
     * A trap for the `[[GetPrototypeOf]]` internal method.
     * @param target The original object which is being proxied.
     */
    public getPrototypeOf(target: T): object | null {
        return Reflect.getPrototypeOf(target);
    }

    /**
     * A trap for the `in` operator.
     * @param target The original object which is being proxied.
     * @param p The name or `Symbol` of the property to check for existence.
     */
    public has(target: T, p: string | symbol): boolean {
        return Reflect.has(target, p);
    }

    /**
     * A trap for `Object.isExtensible()`.
     * @param target The original object which is being proxied.
     */
    public isExtensible(target: T): boolean {
        return Reflect.isExtensible(target);
    }

    /**
     * A trap for `Reflect.ownKeys()`.
     * @param target The original object which is being proxied.
     */
    public ownKeys(target: T): ArrayLike<string | symbol> {
        return Reflect.ownKeys(target);
    }

    /**
     * A trap for `Object.preventExtensions()`.
     * @param target The original object which is being proxied.
     */
    public preventExtensions(target: T): boolean {
        return Reflect.preventExtensions(target);
    }

    /**
     * A trap for setting a property value.
     * @param target The original object which is being proxied.
     * @param p The name or `Symbol` of the property to set.
     * @param receiver The object to which the assignment was originally directed.
     * @returns A `Boolean` indicating whether or not the property was set.
     */
    public set(target: T, p: string | symbol, newValue: any, receiver: any): boolean {
        return Reflect.set(target, p, newValue, receiver);
    }

    /**
     * A trap for `Object.setPrototypeOf()`.
     * @param target The original object which is being proxied.
     * @param newPrototype The object's new prototype or `null`.
     */
    public setPrototypeOf(target: T, v: object | null): boolean {
        return Reflect.setPrototypeOf(target, v);
    }
}
