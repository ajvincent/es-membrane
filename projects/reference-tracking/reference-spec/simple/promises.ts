const target = { isTarget: true };

let resolve: (value: object) => void = function() {};
const secondPromise = new Promise<object>(res => resolve = res);
/*
const firstPromise = Promise.resolve();
const thirdPromise = firstPromise.then(() => secondPromise);
*/

resolve(target);
searchReferences("promise after resolve", target, [secondPromise], true);
/*
searchReferences("promise chain to target", target, [firstPromise], true);
*/
