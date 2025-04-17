import "es-search-references-guest";

class IdObject {
  readonly id: string
  constructor(id: string) {
    this.id = id;
  }
}

const target = new IdObject("target");
const firstValue = new IdObject("firstValue");
const lastValue = new IdObject("lastValue");

async function * objectGenerator(): AsyncGenerator<IdObject, unknown, unknown> {
  yield await Promise.resolve(firstValue);
  yield await Promise.resolve(target);
  yield await Promise.resolve(lastValue);
  return;
}

const generator: AsyncGenerator<IdObject, unknown, unknown> = objectGenerator();
searchReferences("generator holds target strongly", target, [ generator ], true);
