async function* numbers() {
  let i = 0;
  while (i < 10) {
    const n = await Promise.resolve(i++);
    yield n;
  }
}

(async () => {
  for await (const item of numbers()) {
    report(item);
  }
})();
