export class DefaultMap extends Map {
    getDefault(key, builder) {
        let value = this.get(key);
        if (!value) {
            value = builder();
            this.set(key, value);
        }
        return value;
    }
}
export class DefaultWeakMap extends WeakMap {
    getDefault(key, builder) {
        let value = this.get(key);
        if (!value) {
            value = builder();
            this.set(key, value);
        }
        return value;
    }
}
//# sourceMappingURL=DefaultMap.mjs.map