import ReplaceableValue, { ReplaceableValueType } from "#stage_utilities/source/ReplaceableValue.mjs";

it("ReplaceableValue provides a matching replacement for each value it receives", () => {
  class Foo {}
  class Bar {}

  function buildNewReplaceable(): ReplaceableValueType<Foo, Bar> {
    return { source: new Foo, userContext: new Bar};
  }

  const replacer = new ReplaceableValue<Foo, Bar>(buildNewReplaceable);
  const fooOriginal_0 = new Foo;

  const { source: fooReplaced_0, userContext: bar_0} = replacer.get(fooOriginal_0);
  expect(fooReplaced_0).not.toBe(fooOriginal_0);

  const { source: fooReplaced_1, userContext: bar_1} = replacer.get(fooOriginal_0);
  expect(fooReplaced_1).toBe(fooReplaced_0);
  expect(bar_1).toBe(bar_0);

  const { source: fooReplaced_2, userContext: bar_2} = replacer.get(fooReplaced_0);
  expect(fooReplaced_2).toBe(fooReplaced_0);
  expect(bar_2).toBe(bar_0);

  const fooOriginal_3 = new Foo;
  const {source: fooReplaced_3, userContext: bar_3} = replacer.get(fooOriginal_3);
  expect(fooReplaced_3).not.toBe(fooOriginal_0);
  expect(fooReplaced_3).not.toBe(fooReplaced_0);
  expect(fooReplaced_3).not.toBe(fooOriginal_3);
  expect(bar_3).not.toBe(bar_0);
});
