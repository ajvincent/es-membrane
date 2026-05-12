import "es-search-references/guest";

const target = { isTarget: true };
const firstValue = { isFirstValue: true };
const lastValue = { isLastValue: true };

let iterator: IteratorObject<object> = ([firstValue, target, lastValue]).values();
iterator = iterator.filter((p: object): boolean => p !== lastValue);
searchReferences("before visiting any values", target, [iterator], true);

void(iterator.next());
searchReferences("after visiting the first value", target, [iterator], true);

void(iterator.next());
searchReferences("after visiting the target value", target, [iterator], true);

/* we're excluding the last value, so the next call will be { value: undefined, done: true }
void(iterator.next());
searchReferences("after visiting the last value", target, [iterator], true);
*/

void(iterator.next());
searchReferences("after completing the iterator", target, [iterator], true);
