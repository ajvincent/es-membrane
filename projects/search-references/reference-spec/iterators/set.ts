import "es-search-references/guest";

const target = { isTarget: true };
const firstValue = { isFirstValue: true };
const lastValue = { isLastValue: true };

const iterator: SetIterator<object> = new Set([firstValue, target, lastValue]).values();
searchReferences("before visiting any values", target, [iterator], true);

void(iterator.next());
searchReferences("after visiting the first value", target, [iterator], true);

void(iterator.next());
searchReferences("after visiting the target value", target, [iterator], true);

void(iterator.next());
searchReferences("after visiting the last value", target, [iterator], true);

void(iterator.next());
searchReferences("after completing the iterator", target, [iterator], true);
