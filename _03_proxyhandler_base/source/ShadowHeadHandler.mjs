export default class HeadHandler {
    #shadowHandler;
    #currentGraph;
    #targetGraph;
    constructor(shadowHandler, currentGraph, targetGraph) {
        this.#shadowHandler = shadowHandler;
        this.#currentGraph = currentGraph;
        this.#targetGraph = targetGraph;
    }
    #nextTargetAndHandler(shadowTarget) {
        const nextTarget = this.#targetGraph.getNextTargetForShadow(shadowTarget);
        const nextHandler = this.#targetGraph.getHandlerForTarget(nextTarget);
        return { nextTarget, nextHandler };
    }
    apply(shadowTarget, thisArg, argArray) {
        const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
        const [nextThisArg, ...nextArgArray] = this.#targetGraph.convertArguments(thisArg, ...argArray);
        const result = this.#shadowHandler.apply(shadowTarget, thisArg, argArray, nextTarget, nextHandler, nextThisArg, nextArgArray);
        return this.#currentGraph.convertArguments(result)[0];
    }
    construct(shadowTarget, argArray, newTarget) {
        const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
        const [nextNewTarget, ...nextArgArray] = this.#targetGraph.convertArguments(newTarget, ...argArray);
        const result = this.#shadowHandler.construct(shadowTarget, argArray, newTarget, nextTarget, nextHandler, nextArgArray, nextNewTarget);
        return this.#currentGraph.convertArguments(result)[0];
    }
    defineProperty(shadowTarget, p, attributes) {
        const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
        const nextAttributes = this.#targetGraph.convertDescriptor(attributes);
        return this.#shadowHandler.defineProperty(shadowTarget, p, attributes, nextTarget, nextHandler, nextAttributes);
    }
    deleteProperty(shadowTarget, p) {
        const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
        return this.#shadowHandler.deleteProperty(shadowTarget, p, nextTarget, nextHandler);
    }
    get(shadowTarget, p, receiver) {
        const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
        const [nextReceiver] = this.#targetGraph.convertArguments([receiver]);
        const result = this.#shadowHandler.get(shadowTarget, p, receiver, nextTarget, nextHandler, nextReceiver);
        return this.#currentGraph.convertArguments(result)[0];
    }
    getOwnPropertyDescriptor(shadowTarget, p) {
        const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
        const desc = this.#shadowHandler.getOwnPropertyDescriptor(shadowTarget, p, nextTarget, nextHandler);
        return desc ? this.#currentGraph.convertDescriptor(desc) : desc;
    }
    getPrototypeOf(shadowTarget) {
        const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
        const proto = this.#shadowHandler.getPrototypeOf(shadowTarget, nextTarget, nextHandler);
        return this.#currentGraph.convertArguments(proto)[0];
    }
    has(shadowTarget, p) {
        const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
        return this.#shadowHandler.has(shadowTarget, p, nextTarget, nextHandler);
    }
    isExtensible(shadowTarget) {
        const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
        return this.#shadowHandler.isExtensible(shadowTarget, nextTarget, nextHandler);
    }
    ownKeys(shadowTarget) {
        const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
        return this.#shadowHandler.ownKeys(shadowTarget, nextTarget, nextHandler);
    }
    preventExtensions(shadowTarget) {
        const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
        return this.#shadowHandler.preventExtensions(shadowTarget, nextTarget, nextHandler);
    }
    set(shadowTarget, p, value, receiver) {
        const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
        const [nextValue, nextReceiver] = this.#targetGraph.convertArguments(value, receiver);
        return this.#shadowHandler.set(shadowTarget, p, value, receiver, nextTarget, nextHandler, nextValue, nextReceiver);
    }
    setPrototypeOf(shadowTarget, proto) {
        const { nextTarget, nextHandler } = this.#nextTargetAndHandler(shadowTarget);
        const [nextProto] = this.#targetGraph.convertArguments(proto);
        return this.#shadowHandler.setPrototypeOf(shadowTarget, proto, nextTarget, nextHandler, nextProto);
    }
}
//# sourceMappingURL=ShadowHeadHandler.mjs.map