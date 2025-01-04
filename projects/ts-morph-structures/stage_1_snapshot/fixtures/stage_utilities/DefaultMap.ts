export class DefaultMap<K, V> extends Map<K, V>
{
  getDefault(key: K, builder: () => V): V {
    let value = this.get(key);
    if (!value) {
      value = builder();
      this.set(key, value);
    }
    return value;
  }
}

export class DefaultWeakMap<K extends object, V> extends WeakMap<K, V>
{
  getDefault(key: K, builder: () => V): V {
    let value = this.get(key);
    if (!value) {
      value = builder();
      this.set(key, value);
    }
    return value;
  }
}
