import "es-search-references-guest";

const target = { isTarget: true };
const firstValue = { isFirstValue: true };
const lastValue = { isLastValue: true };

const iterator: MapIterator<object> = new Map<number, object>([
  [0, firstValue],
  [1, target,],
  [2, lastValue]
]).values();
searchReferences("before visiting any values", target, [iterator], true);

void(iterator.next());
searchReferences("after visiting the first value", target, [iterator], true);

void(iterator.next());
searchReferences("after visiting the target value", target, [iterator], true);

void(iterator.next());
searchReferences("after visiting the last value", target, [iterator], true);
