import NST_NotImplemented_Base from "#aspects/test-fixtures/fixtures/generated/stubs/NotImplemented_Base.mjs";

describe("stub-ts-morph: notImplemented", () => {
  it("with default return types throws for all methods", () => {
    expect(Reflect.ownKeys(NST_NotImplemented_Base.prototype)).toEqual([
      "constructor",
      "repeatForward",
      "repeatBack"
    ]);

    const nst = new NST_NotImplemented_Base;
    expect(() => nst.repeatForward("foo", 3)).toThrowError("not yet implemented");
    expect(() => nst.repeatBack(3, "foo")).toThrowError("not yet implemented");
  });
});
