import MethodDecoratedClass from "#aspects/test-fixtures/fixtures/generated/stubs/SpyMethodDecorated.mjs";
import NumberStringClass from "#aspects/test-fixtures/fixtures/components/NumberStringClass.mjs";

it("MethodDecoratorsOfClass applies decorators from a configuration to build a class", () => {
  const NST_Class = MethodDecoratedClass(NumberStringClass);
  const nst = new NST_Class;

  expect<string>(nst.repeatBack(3, "foo")).toBe("foofoofoo");

  expect(
    (NST_Class as unknown as { backEvents: unknown[]}).backEvents
  ).toEqual([["repeatBack", 3, "foo"]]);
});
