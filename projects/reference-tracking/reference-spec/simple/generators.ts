class IdObject {
  readonly id: string
  constructor(id: string) {
    this.id = id;
  }
}

const target = new IdObject("target");
const firstValue = new IdObject("firstValue");
const lastValue = new IdObject("lastValue");

function * objectGenerator() {
  yield firstValue;
  yield target;
  return lastValue;
}

const generator: Generator<IdObject, IdObject, unknown> = objectGenerator();
searchReferences("generator holds target strongly", target, [ generator ], true);
