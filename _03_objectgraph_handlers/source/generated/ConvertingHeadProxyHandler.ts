// This file is generated.  Do not edit.
import type { MembraneIfc } from "../types/MembraneIfc.js";
import type { RequiredProxyHandler } from "../types/RequiredProxyHandler.js";
import type { ObjectGraphHandlerIfc } from "./types/ObjectGraphHandlerIfc.js";
type CommonConversions = {
        realTarget: object;
        graphKey: string | symbol;
        nextHandler: RequiredProxyHandler;
    };

export default abstract class ConvertingHeadProxyHandler implements Required<ProxyHandler<object>> {
    #membraneIfc: MembraneIfc;
    #graphHandlerIfc: ObjectGraphHandlerIfc;

    constructor(membraneIfc: MembraneIfc, graphHandlerIfc: ObjectGraphHandlerIfc) {
        this.#membraneIfc = membraneIfc;
        this.#graphHandlerIfc = graphHandlerIfc;
    }

    protected abstract getRealTargetForShadowTarget(shadowTarget: object): object;

    protected abstract getTargetGraphKeyForRealTarget(realTarget: object): string | symbol;

    protected abstract getValueInGraph<ValueType>(value: ValueType): ValueType;

    protected abstract getDescriptorInGraph(desc: PropertyDescriptor): PropertyDescriptor;

    #getCommonConversions(target: object): CommonConversions {
        const realTarget: object = this.getRealTargetForShadowTarget(target);
        const graphKey: string | symbol = this.getTargetGraphKeyForRealTarget(realTarget);
        const nextHandler: RequiredProxyHandler = this.#membraneIfc.getHandlerForTarget(graphKey, realTarget);
        return { realTarget, graphKey, nextHandler };
    }

    /**
     * A trap method for a function call.
     * @param target The original callable object which is being proxied.
     */
    public apply(target: object, thisArg: any, argArray: any[]): any {
        const { realTarget, graphKey, nextHandler } = this.#getCommonConversions(target);
        const [nextThisArg, nextArgArray] = this.#membraneIfc.convertArray<[any, any[]]>(graphKey, [thisArg, argArray]);
        const result: any = this.#graphHandlerIfc.apply(target, thisArg, argArray, nextHandler, realTarget, nextThisArg, nextArgArray);
        return this.getValueInGraph<any>(result);
    }

    /**
     * A trap for the `new` operator.
     * @param target The original object which is being proxied.
     * @param newTarget The constructor that was originally called.
     */
    public construct(target: object, argArray: any[], newTarget: Function): object {
        const { realTarget, graphKey, nextHandler } = this.#getCommonConversions(target);
        const [nextArgArray, nextNewTarget] = this.#membraneIfc.convertArray<[any[], Function]>(graphKey, [argArray, newTarget]);
        const result: object = this.#graphHandlerIfc.construct(target, argArray, newTarget, nextHandler, realTarget, nextArgArray, nextNewTarget);
        return this.getValueInGraph<object>(result);
    }

    /**
     * A trap for `Object.defineProperty()`.
     * @param target The original object which is being proxied.
     * @returns A `Boolean` indicating whether or not the property has been defined.
     */
    public defineProperty(target: object, property: string | symbol, attributes: PropertyDescriptor): boolean {
        const { realTarget, graphKey, nextHandler } = this.#getCommonConversions(target);
        const [nextProperty] = this.#membraneIfc.convertArray<[string | symbol]>(graphKey, [property]);
        const nextAttributes: PropertyDescriptor = this.#membraneIfc.convertDescriptor(graphKey, attributes);
        const result: boolean = this.#graphHandlerIfc.defineProperty(target, property, attributes, nextHandler, realTarget, nextProperty, nextAttributes);
        return this.getValueInGraph<boolean>(result);
    }

    /**
     * A trap for the `delete` operator.
     * @param target The original object which is being proxied.
     * @param p The name or `Symbol` of the property to delete.
     * @returns A `Boolean` indicating whether or not the property was deleted.
     */
    public deleteProperty(target: object, p: string | symbol): boolean {
        const { realTarget, graphKey, nextHandler } = this.#getCommonConversions(target);
        const [nextP] = this.#membraneIfc.convertArray<[string | symbol]>(graphKey, [p]);
        const result: boolean = this.#graphHandlerIfc.deleteProperty(target, p, nextHandler, realTarget, nextP);
        return this.getValueInGraph<boolean>(result);
    }

    /**
     * A trap for getting a property value.
     * @param target The original object which is being proxied.
     * @param p The name or `Symbol` of the property to get.
     * @param receiver The proxy or an object that inherits from the proxy.
     */
    public get(target: object, p: string | symbol, receiver: any): any {
        const { realTarget, graphKey, nextHandler } = this.#getCommonConversions(target);
        const [nextP, nextReceiver] = this.#membraneIfc.convertArray<[string | symbol, any]>(graphKey, [p, receiver]);
        const result: any = this.#graphHandlerIfc.get(target, p, receiver, nextHandler, realTarget, nextP, nextReceiver);
        return this.getValueInGraph<any>(result);
    }

    /**
     * A trap for `Object.getOwnPropertyDescriptor()`.
     * @param target The original object which is being proxied.
     * @param p The name of the property whose description should be retrieved.
     */
    public getOwnPropertyDescriptor(target: object, p: string | symbol): PropertyDescriptor | undefined {
        const { realTarget, graphKey, nextHandler } = this.#getCommonConversions(target);
        const [nextP] = this.#membraneIfc.convertArray<[string | symbol]>(graphKey, [p]);
        const result: PropertyDescriptor | undefined = this.#graphHandlerIfc.getOwnPropertyDescriptor(target, p, nextHandler, realTarget, nextP);
        return result ? this.getDescriptorInGraph(result) : this.getValueInGraph(undefined);
    }

    /**
     * A trap for the `[[GetPrototypeOf]]` internal method.
     * @param target The original object which is being proxied.
     */
    public getPrototypeOf(target: object): object | null {
        const { realTarget, graphKey, nextHandler } = this.#getCommonConversions(target);
        const result: object | null = this.#graphHandlerIfc.getPrototypeOf(target, nextHandler, realTarget);
        return this.getValueInGraph<object | null>(result);
    }

    /**
     * A trap for the `in` operator.
     * @param target The original object which is being proxied.
     * @param p The name or `Symbol` of the property to check for existence.
     */
    public has(target: object, p: string | symbol): boolean {
        const { realTarget, graphKey, nextHandler } = this.#getCommonConversions(target);
        const [nextP] = this.#membraneIfc.convertArray<[string | symbol]>(graphKey, [p]);
        const result: boolean = this.#graphHandlerIfc.has(target, p, nextHandler, realTarget, nextP);
        return this.getValueInGraph<boolean>(result);
    }

    /**
     * A trap for `Object.isExtensible()`.
     * @param target The original object which is being proxied.
     */
    public isExtensible(target: object): boolean {
        const { realTarget, graphKey, nextHandler } = this.#getCommonConversions(target);
        const result: boolean = this.#graphHandlerIfc.isExtensible(target, nextHandler, realTarget);
        return this.getValueInGraph<boolean>(result);
    }

    /**
     * A trap for `Reflect.ownKeys()`.
     * @param target The original object which is being proxied.
     */
    public ownKeys(target: object): ArrayLike<string | symbol> {
        const { realTarget, graphKey, nextHandler } = this.#getCommonConversions(target);
        const result: ArrayLike<string | symbol> = this.#graphHandlerIfc.ownKeys(target, nextHandler, realTarget);
        return this.getValueInGraph<ArrayLike<string | symbol>>(result);
    }

    /**
     * A trap for `Object.preventExtensions()`.
     * @param target The original object which is being proxied.
     */
    public preventExtensions(target: object): boolean {
        const { realTarget, graphKey, nextHandler } = this.#getCommonConversions(target);
        const result: boolean = this.#graphHandlerIfc.preventExtensions(target, nextHandler, realTarget);
        return this.getValueInGraph<boolean>(result);
    }

    /**
     * A trap for setting a property value.
     * @param target The original object which is being proxied.
     * @param p The name or `Symbol` of the property to set.
     * @param receiver The object to which the assignment was originally directed.
     * @returns A `Boolean` indicating whether or not the property was set.
     */
    public set(target: object, p: string | symbol, newValue: any, receiver: any): boolean {
        const { realTarget, graphKey, nextHandler } = this.#getCommonConversions(target);
        const [nextP, nextNewValue, nextReceiver] = this.#membraneIfc.convertArray<[string | symbol, any, any]>(graphKey, [p, newValue, receiver]);
        const result: boolean = this.#graphHandlerIfc.set(target, p, newValue, receiver, nextHandler, realTarget, nextP, nextNewValue, nextReceiver);
        return this.getValueInGraph<boolean>(result);
    }

    /**
     * A trap for `Object.setPrototypeOf()`.
     * @param target The original object which is being proxied.
     * @param newPrototype The object's new prototype or `null`.
     */
    public setPrototypeOf(target: object, v: object | null): boolean {
        const { realTarget, graphKey, nextHandler } = this.#getCommonConversions(target);
        const [nextV] = this.#membraneIfc.convertArray<[object | null]>(graphKey, [v]);
        const result: boolean = this.#graphHandlerIfc.setPrototypeOf(target, v, nextHandler, realTarget, nextV);
        return this.getValueInGraph<boolean>(result);
    }
}
