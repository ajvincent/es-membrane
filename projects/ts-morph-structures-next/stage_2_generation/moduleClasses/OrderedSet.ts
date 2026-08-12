export default class OrderedSet<V> extends Set<V> {
  public sort(comparator: (a: V, b: V) => number): void {
    const values = Array.from(this);
    values.sort(comparator);

    this.clear();
    for (const value of values) {
      this.add(value);
    }
  }
}
