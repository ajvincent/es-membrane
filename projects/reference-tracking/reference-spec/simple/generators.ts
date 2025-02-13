const target = { isTarget: true };
const firstValue = { isFirstValue: true };
const lastValue = { isLastValue: true };

function * objectGenerator() {
  yield firstValue;
  yield target;
  return lastValue;
}

const generator = objectGenerator();
searchReferences("generator holds target strongly", target, [ generator ], true);
searchReferences("generator holds target weakly", target, [ generator ], true);
