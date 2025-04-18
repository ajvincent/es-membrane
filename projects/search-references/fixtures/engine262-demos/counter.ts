async function * numbers(): AsyncGenerator<number, void, unknown> {
  let i = 0;
  while (i < 10) {
    const n: number = await Promise.resolve(i++);
    yield n;
  }
}

(async () => {
  for await (const item of numbers()) {
    report([item]);
  }
})();
