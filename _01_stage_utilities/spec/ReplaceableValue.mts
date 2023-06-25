import ReplaceableValue from "#stage_utilities/source/ReplaceableValue.mjs";

it("ReplaceableValue provides a matching replacement for each value it receives", () => {
  class Foo {}
  class Bar {}

  const replacer = new ReplaceableValue<Foo, Bar>(Bar);
  const fooOriginal_0 = new Foo;

  expect<boolean>(replacer.has(fooOriginal_0)).toBe(false);
  expect(
    () => replacer.get(fooOriginal_0)
  ).toThrowError("no replacement defined!");

  const { source: fooReplaced_0, userContext: bar_0} = replacer.getDefault(fooOriginal_0, () => new Foo);
  expect(fooReplaced_0).not.toBe(fooOriginal_0);
  expect(bar_0).toBeInstanceOf(Bar);

  expect<boolean>(replacer.has(fooOriginal_0)).toBe(true);
  expect(replacer.get(fooOriginal_0)).toEqual({source: fooReplaced_0, userContext: bar_0});

  expect<boolean>(replacer.has(fooReplaced_0)).toBe(true);
  expect(replacer.get(fooReplaced_0)).toEqual({source: fooReplaced_0, userContext: bar_0});

  const { source: fooReplaced_1, userContext: bar_1} = replacer.getDefault(fooOriginal_0, () => new Foo);
  expect(fooReplaced_1).toBe(fooReplaced_0);
  expect(bar_1).toBe(bar_0);

  const { source: fooReplaced_2, userContext: bar_2} = replacer.getDefault(fooReplaced_0, () => new Foo);
  expect(fooReplaced_2).toBe(fooReplaced_0);
  expect(bar_2).toBe(bar_0);

  const fooOriginal_3 = new Foo;
  const {source: fooReplaced_3, userContext: bar_3} = replacer.getDefault(fooOriginal_3, () => new Foo);
  expect(fooReplaced_3).not.toBe(fooOriginal_0);
  expect(fooReplaced_3).not.toBe(fooReplaced_0);
  expect(fooReplaced_3).not.toBe(fooOriginal_3);
  expect(bar_3).not.toBe(bar_0);
  expect(bar_3).toBeInstanceOf(Bar);
});
