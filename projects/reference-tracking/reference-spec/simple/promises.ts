const target = { isTarget: true };

let resolve: (value: object) => void = function() {};
const promise = new Promise<object>(res => resolve = res);

resolve(target);
searchReferences("promise after resolve", target, [promise], true);
