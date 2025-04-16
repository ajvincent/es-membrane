const target = { isTarget: true };
const firstValue = { isFirstValue: true };
const lastValue = { isLastValue: true };

class ObjectIterator implements Iterator<object> {
  #count = 0;
  next(...[value]: [] | [unknown]): IteratorResult<object, unknown> {
    void(value);
    if (this.#count === 0) {
      this.#count++;
      return { value: firstValue, done: false };
    }

    if (this.#count === 1) {
      this.#count++;
      return { value: target, done: false };
    }

    if (this.#count === 2) {
      this.#count++;
      return { value: lastValue, done: true };
    }

    return { value: undefined, done: true };
  }
}
const iter = new ObjectIterator;

searchReferences("no explicit hold", target, [ iter ], true);
