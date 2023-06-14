import ReplaceableValue, { ReplaceableValueType } from "#stage_utilities/source/ReplaceableValue.mjs";

it("ReplaceableValue provides a matching replacement for each value it receives", () => {
  class Foo {}
  class Bar {}

  const replacer = new ReplaceableValue<Foo, Bar>;
  const fooOriginal_0 = new Foo;

  function buildNewReplaceable(): ReplaceableValueType<Foo, Bar> {
    return { source: new Foo, context: new Bar};
  }

  function unreachable(): never {
    throw new Error("unreached");
  }

  const { source: fooReplaced_0, context: bar_0} = replacer.get(fooOriginal_0, buildNewReplaceable);
  expect(fooReplaced_0).not.toBe(fooOriginal_0);

  const { source: fooReplaced_1, context: bar_1} = replacer.get(fooOriginal_0, unreachable);
  expect(fooReplaced_1).toBe(fooReplaced_0);
  expect(bar_1).toBe(bar_0);

  const { source: fooReplaced_2, context: bar_2} = replacer.get(fooReplaced_0, unreachable);
  expect(fooReplaced_2).toBe(fooReplaced_0);
  expect(bar_2).toBe(bar_0);

  const fooOriginal_3 = new Foo;
  const {source: fooReplaced_3, context: bar_3} = replacer.get(fooOriginal_3, buildNewReplaceable);
  expect(fooReplaced_3).not.toBe(fooOriginal_0);
  expect(fooReplaced_3).not.toBe(fooReplaced_0);
  expect(fooReplaced_3).not.toBe(fooOriginal_3);
  expect(bar_3).not.toBe(bar_0);
});
