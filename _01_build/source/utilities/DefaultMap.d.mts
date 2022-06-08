export declare class DefaultMap<K, V> extends Map<K, V> {
    getDefault(key: K, builder: () => V): V;
}
export declare class DefaultWeakMap<K extends object, V> extends WeakMap<K, V> {
    getDefault(key: K, builder: () => V): V;
}
