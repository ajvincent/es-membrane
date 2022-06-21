import PropertyKeySorter, { propertyKey } from "../source/PropertyKeySorter.mjs";

describe("Property key sorter", () => {
  const str0 = "0", str1 = "1", sym0 = Symbol("0"), sym1 = Symbol("1");
  let sorter: PropertyKeySorter, items: propertyKey[];
  beforeEach(() => sorter = new PropertyKeySorter);

  it("puts strings in normal sorted order", () => {
    items = [str0, str1];
    sorter.sort(items);

    expect(items).toEqual([str0, str1]);

    items = [str1, str0];
    sorter.sort(items);

    expect(items).toEqual([str0, str1]);
  });

  it("preserves a string before a registered symbol", () => {
    items = [str0, sym0];
    sorter.addSymbol(sym0);
    sorter.sort(items);

    expect(items).toEqual([str0, sym0]);
  });

  it("moves a string before a registered symbol", () => {
    items = [sym0, str0];
    sorter.addSymbol(sym0);
    sorter.sort(items);

    expect(items).toEqual([str0, sym0]);
  });

  it("preserves a string before a non-registered symbol", () => {
    items = [str0, sym0];
    sorter.sort(items);

    expect(items).toEqual([str0, sym0]);
  });

  it("moves a string before a non-registered symbol", () => {
    items = [sym0, str0];
    sorter.sort(items);

    expect(items).toEqual([str0, sym0]);
  });

  it("preserves a registered symbol before a non-registered symbol", () => {
    items = [sym0, sym1];
    sorter.addSymbol(sym0);
    sorter.sort(items);

    expect(items).toEqual([sym0, sym1]);
  });

  it("moves a registered symbol before a non-registered symbol", () => {
    items = [sym1, sym0];
    sorter.addSymbol(sym0);
    sorter.sort(items);

    expect(items).toEqual([sym0, sym1]);
  });

  it("preserves the ordering of registered symbols", () => {
    items = [sym0, sym1];
    sorter.addSymbol(sym0);
    sorter.addSymbol(sym1);
    sorter.sort(items);

    expect(items).toEqual([sym0, sym1]);
  });

  it("enforces the ordering of registered symbols", () => {
    items = [sym1, sym0];
    sorter.addSymbol(sym0);
    sorter.addSymbol(sym1);
    sorter.sort(items);

    expect(items).toEqual([sym0, sym1]);
  });

  it("registers unknown symbols as it discovers them", () => {
    items = [sym1, sym0];
    sorter.sort(items);

    expect(items).toEqual([sym1, sym0]);

    items = [sym0, sym1];
    sorter.sort(items);
    expect(items).toEqual([sym1, sym0]);

    items = [sym1, sym0];
    sorter.sort(items);

    expect(items).toEqual([sym1, sym0]);
  });
});
