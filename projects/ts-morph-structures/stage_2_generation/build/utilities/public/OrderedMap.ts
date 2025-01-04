export default class OrderedMap<K, V> extends Map<K, V> {
  sortEntries(comparator: (a: [K, V], b: [K, V]) => number): void {
    const entries: [K, V][] = Array.from(this.entries());
    entries.sort(comparator);

    this.clear();
    for (const [key, value] of entries) {
      this.set(key, value);
    }
  }
}
