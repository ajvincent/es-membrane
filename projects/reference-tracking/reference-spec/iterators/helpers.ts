const target = { isTarget: true };
const firstValue = { isFirstValue: true };
const lastValue = { isLastValue: true };

let iterator: ArrayIterator<object> = ([firstValue, target, lastValue]).values();
//@ts-expect-error this isn't supported in TypeScript's ES2024... ES2025 may have it.
iterator = iterator.filter((p: object): boolean => p !== lastValue);
searchReferences("before visiting any values", target, [iterator], true);

void(iterator.next());
searchReferences("after visiting the first value", target, [iterator], true);

void(iterator.next());
searchReferences("after visiting the target value", target, [iterator], true);

void(iterator.next());
searchReferences("after visiting the last value", target, [iterator], true);
