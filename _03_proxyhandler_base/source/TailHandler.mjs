export default class TailHandler {
    apply(shadowTarget, thisArg, argArray, nextTarget, nextHandler, nextThisArg, nextArgArray) {
        void (shadowTarget);
        void (thisArg);
        void (argArray);
        return nextHandler.apply(nextTarget, nextThisArg, nextArgArray);
    }
    construct(shadowTarget, argArray, newTarget, nextTarget, nextHandler, nextArgArray, nextNewTarget) {
        void (shadowTarget);
        void (argArray);
        void (newTarget);
        return nextHandler.construct(nextTarget, nextArgArray, nextNewTarget);
    }
    defineProperty(shadowTarget, p, attributes, nextTarget, nextHandler, nextAttributes) {
        void (shadowTarget);
        void (attributes);
        return nextHandler.defineProperty(nextTarget, p, nextAttributes);
    }
    deleteProperty(shadowTarget, p, nextTarget, nextHandler) {
        void (shadowTarget);
        return nextHandler.deleteProperty(nextTarget, p);
    }
    get(shadowTarget, p, receiver, nextTarget, nextHandler, nextReceiver) {
        void (shadowTarget);
        void (receiver);
        return nextHandler.get(nextTarget, p, nextReceiver);
    }
    getOwnPropertyDescriptor(shadowTarget, p, nextTarget, nextHandler) {
        void (shadowTarget);
        return nextHandler.getOwnPropertyDescriptor(nextTarget, p);
    }
    getPrototypeOf(shadowTarget, nextTarget, nextHandler) {
        void (shadowTarget);
        return nextHandler.getPrototypeOf(nextTarget);
    }
    has(shadowTarget, p, nextTarget, nextHandler) {
        void (shadowTarget);
        return nextHandler.has(nextTarget, p);
    }
    isExtensible(shadowTarget, nextTarget, nextHandler) {
        void (shadowTarget);
        return nextHandler.isExtensible(nextTarget);
    }
    ownKeys(shadowTarget, nextTarget, nextHandler) {
        void (shadowTarget);
        return nextHandler.ownKeys(nextTarget);
    }
    preventExtensions(shadowTarget, nextTarget, nextHandler) {
        void (shadowTarget);
        return nextHandler.preventExtensions(nextTarget);
    }
    set(shadowTarget, p, value, receiver, nextTarget, nextHandler, nextValue, nextReceiver) {
        void (shadowTarget);
        void (value);
        void (receiver);
        return nextHandler.set(nextTarget, p, nextValue, nextReceiver);
    }
    setPrototypeOf(shadowTarget, proto, nextTarget, nextHandler, nextProto) {
        void (shadowTarget);
        void (proto);
        return nextHandler.setPrototypeOf(nextTarget, nextProto);
    }
}
//# sourceMappingURL=TailHandler.mjs.map