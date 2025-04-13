const target = { isTarget: true };

{
  const { promise, resolve } = Promise.withResolvers<object>();
  resolve(target);
  searchReferences("promise directly resolved to target", target, [promise], true);
}

{
  const { promise, reject } = Promise.withResolvers<void>();
  reject(target);
  searchReferences("promise directly rejected to target", target, [promise], true);
  promise.catch(() => { void(null); });
}

//#region then, resolve()
{
  const { promise, resolve } = Promise.withResolvers<void>();
  const afterPromise: Promise<object> = promise.then(() => target);
  searchReferences("promise.then() to target, before resolve", target, [promise], true);
  searchReferences("promise.then() pending target, before resolve", target, [afterPromise], true);
  resolve();

  // this runs the jobs through promise and afterPromise.
  await Promise.resolve();

  searchReferences("promise.then() to target, after resolve", target, [promise], true);
  searchReferences("promise.then() resolved to target", target, [afterPromise], true);
}
//#endregion then, resolve()

//#region catch, resolve()
{
  const { promise, resolve } = Promise.withResolvers<void>();
  const afterPromise: Promise<object | void> = promise.catch(() => target);
  searchReferences("promise.catch() to target, before resolve", target, [promise], true);
  searchReferences("promise.catch() pending target, before resolve", target, [afterPromise], true);
  resolve();

  // this runs the jobs through promise and afterPromise.
  await Promise.resolve();

  searchReferences("promise.catch() to target, after resolve", target, [promise], true);
  searchReferences("promise.catch() resolved to target", target, [afterPromise], true);
}
//#endregion catch, resolve()

//#region finally, resolve()
{
  const { promise, resolve } = Promise.withResolvers<void>();
  promise.finally(() => void(target));
  searchReferences("promise.finally() to target, before resolve", target, [promise], true);
  resolve();

  // this runs the jobs through promise and afterPromise.
  await Promise.resolve();

  searchReferences("promise.finally() to target, after resolve", target, [promise], true);
}
//#endregion finally, resolve()

//#region then, reject()
{
  const { promise, reject } = Promise.withResolvers<void>();
  const afterPromise: Promise<object> = promise.then(() => target);
  afterPromise.catch(() => void(null));
  // no test before reject, as this duplicates the .then()/resolve() case above to this point
  reject();

  // this runs the jobs through promise and afterPromise.
  await Promise.resolve();

  searchReferences("promise.then() to target, after reject", target, [promise], true);
  searchReferences("promise.then() rejected to target", target, [afterPromise], true);
}
//#endregion then, reject()

//#region catch, reject()
{
  const { promise, reject } = Promise.withResolvers<void>();
  const afterPromise: Promise<object | void> = promise.catch(() => target);
  // no test before reject, as this duplicates the .catch()/resolve() case above to this point
  reject();

  // this runs the jobs through promise and afterPromise.
  await Promise.resolve();

  searchReferences("promise.catch() to target, after reject", target, [promise], true);
  searchReferences("promise.catch() rejected to target", target, [afterPromise], true);
}

//#region finally, reject()
{
  const { promise, reject } = Promise.withResolvers<void>();
  promise.finally(() => target).catch(() => void(null));
  // no test before reject, as this duplicates the .finally()/resolve() case above to this point
  reject();

  // this runs the jobs through promise and afterPromise.
  await Promise.resolve();

  searchReferences("promise.finally() to target, after reject", target, [promise], true);
}
//#endregion finally, reject()

/*
  Promise.all, Promise.race, etc. do not hold references to their passed-in
  iterable's members.  Rather, each member holds a reference to the returned promise.

  So looking up references on a Promise.all call is useless.
*/
