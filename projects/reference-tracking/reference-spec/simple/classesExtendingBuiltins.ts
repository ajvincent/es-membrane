class DefaultWeakMap<K extends WeakKey, V> extends WeakMap<K, V>
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

const map = new DefaultWeakMap<object, boolean>;
const target = {};
map.set(target, true);

searchReferences("DefaultWeakMap extends WeakMap", target, [map], true);
