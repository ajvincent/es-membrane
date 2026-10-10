import type {
  InnerTypeElement
} from "#stage_two/snapshot/source/array-utilities/_types/InnerTypeElements.js";

import {
  BUILD_ARRAY_WRAPPER,
  CONVERT_OUTER_TO_INNER,
  GET_OUTER_TYPE,
} from "#stage_two/snapshot/source/array-utilities/symbols.js";

import {
  ShadowArrayImpl
} from "#stage_two/snapshot/source/array-utilities/ShadowArrayImpl.js";

describe("ShadowArray", () => {
  class Color implements InnerTypeElement<string>
  {
    #name: string;
    constructor(name: string) {
      this.#name = name;
    }

    [GET_OUTER_TYPE](): string {
      return this.#name;
    }
  }

  class ColorArray extends ShadowArrayImpl<string, Color> {
    public static createProxy(
      innerElements: Color[]
    ): string[]
    {
      return new ColorArray(innerElements).proxy;
    }

    protected [BUILD_ARRAY_WRAPPER](this: void, innerElements: Color[]): ShadowArrayImpl<string, Color> {
      return new ColorArray(innerElements);
    }

    protected [CONVERT_OUTER_TO_INNER](this: void, outerType: string): Color {
      return new Color(outerType);
    }
  }

  let innerElements: Color[];
  let expected: string[];
  let proxy: string[];

  beforeEach(() => {
    innerElements = [
      new Color("red"),
      new Color("blue"),
    ];

    proxy = ColorArray.createProxy(innerElements);
    expected = ["red", "blue"];
  });

  describe("numeric proxy", () => {
    it(".[GET_PROXY].ownKeys() works", () => {
      expect(Reflect.ownKeys(proxy)).toEqual(Reflect.ownKeys(expected));
    });

    it("[[GetOwnPropertyDescriptor]](length) works", () => {
      const expectedDesc = Reflect.getOwnPropertyDescriptor(expected, "length");
      const actual = Reflect.getOwnPropertyDescriptor(proxy, "length");
      expect(actual).toEqual(expectedDesc);
    });

    it("[[Get]](length) works", () => {
      const actualLength: number = proxy.length;
      expect(actualLength).toBe(expected.length);
    });

    it("[[GetOwnPropertyDescriptor]](1) works", () => {
      const expectedDesc = Reflect.getOwnPropertyDescriptor(expected, 1);
      const actualDesc = Reflect.getOwnPropertyDescriptor(proxy, 1);
      expect(actualDesc).toEqual(expectedDesc);
    });

    it("[[Get]](1) works", () => {
      const expectedValue = expected[1];
      const actualValue = proxy[1];
      expect(actualValue).toEqual(expectedValue);
    });

    it("[[Has]] works", () => {
      expect(Reflect.has(expected, 2)).withContext(`expected[[Has]](2)`).toBeFalse();
      expect(Reflect.has(proxy, 2)).withContext(`proxy[[Has]](2)`).toBeFalse();

      expect(Reflect.has(expected, 1)).withContext(`expected[[Has]](1)`).toBeTrue();
      expect(Reflect.has(proxy, 1)).withContext(`proxy[[Has]](1)`).toBeTrue();

      expect(Reflect.has(expected, "length")).withContext(`expected[[Has]]("length")`).toBeTrue();
      expect(Reflect.has(proxy, "length")).withContext(`proxy[[Has]]("length")`).toBeTrue();

      expect(Reflect.has(expected, "push")).withContext(`expected[[Has]]("push")`).toBeTrue();
      expect(Reflect.has(proxy, "push")).withContext(`proxy[[Has]]("push")`).toBeTrue();
    });

    it(`[[DefineProperty]]("length") works`, () => {
      const desc: PropertyDescriptor = { value: 1 };

      expect(Reflect.defineProperty(expected, "length", desc)).toBeTrue();
      expect(expected).toEqual(["red"]);

      expect(Reflect.defineProperty(proxy, "length", desc)).toBeTrue();
      expect(proxy.length).toBe(1);
      expect(proxy[0]).toBe("red");

      expect(Reflect.getOwnPropertyDescriptor(proxy, "length")).toEqual(Reflect.getOwnPropertyDescriptor(expected, "length"));

      expect(innerElements).toEqual([new Color("red")]);
    });

    it("[[DefineProperty]](0) works", () => {
      const desc: PropertyDescriptor = {
        value: "green",
        writable: true,
        enumerable: true,
        configurable: true,
      };
      expect(Reflect.defineProperty(expected, 0, desc)).toBeTrue();
      expect(expected[0]).toBe("green");
      expect(expected.length).toBe(2);

      expect(Reflect.defineProperty(proxy, 0, desc)).toBeTrue();
      expect(proxy[0]).toBe("green");
      expect(proxy.length).toBe(2);

      expect(Reflect.getOwnPropertyDescriptor(proxy, 0)).toEqual(Reflect.getOwnPropertyDescriptor(expected, 0));

      expect(innerElements[0]).toEqual(new Color("green"));
    });

    it("[[DefineProperty]](2) works", () => {
      const desc: PropertyDescriptor = {
        value: "green",
        writable: true,
        enumerable: true,
        configurable: true,
      };
      expect(Reflect.defineProperty(expected, 2, desc)).withContext(`expected[2] = "green"`).toBeTrue();
      expect(Reflect.defineProperty(proxy, 2, desc)).withContext(`proxy[2] = "green"`).toBeTrue();

      expect(expected[2]).withContext("expected[[Get]](2)").toBe("green");
      expect(expected.length).withContext(`expected[[Get]]("length")`).toBe(3);

      expect(proxy[2]).withContext(`proxy[[Get]](2)`).toBe("green");
      expect(proxy.length).withContext(`proxy[[Get]]("length")`).toBe(3);

      expect(innerElements[2]).toEqual(new Color("green"));
    });

    it(`[[Set]]("length", 1) works`, () => {
      expected.length = 1;
      expect(expected).toEqual(["red"]);

      proxy.length = 1;
      expect(proxy.length).toBe(1);
      expect(proxy[0]).toBe("red");

      expect(Reflect.getOwnPropertyDescriptor(proxy, "length")).toEqual(Reflect.getOwnPropertyDescriptor(expected, "length"));
      expect(innerElements).toEqual([new Color("red")]);
    });

    it(`[[Set]]("length", 4) works`, () => {
      expected.length = 4;
      expect(expected).toEqual(["red", "blue", undefined as unknown as string, undefined as unknown as string]);

      proxy.length = 4;
      expect(proxy.length).toBe(4);
      expect(proxy[0]).toBe("red");
      expect(proxy[1]).toBe("blue");
      expect(proxy[2]).toBeUndefined();
      expect(proxy[3]).toBeUndefined();

      expect(innerElements).toEqual([
        new Color("red"),
        new Color("blue"),
        undefined as unknown as Color,
        undefined as unknown as Color
      ]);
    });

    it(`[[Set]](0, "green") works`, () => {
      expected[0] = "green";
      expect(expected).toEqual(["green", "blue"]);

      proxy[0] = "green";
      expect(proxy.length).toBe(2);
      expect(proxy[0]).toBe("green");
      expect(proxy[1]).toBe("blue");

      expect(innerElements).toEqual([
        new Color("green"),
        new Color("blue"),
      ]);
    });

    it(`[[Set]](2, "green") works`, () => {
      expected[2] = "green";
      expect(expected).toEqual(["red", "blue", "green"]);

      proxy[2] = "green";
      expect(proxy.length).toBe(3);
      expect(proxy[0]).toBe("red");
      expect(proxy[1]).toBe("blue");
      expect(proxy[2]).toBe("green");

      expect(innerElements).toEqual([
        new Color("red"),
        new Color("blue"),
        new Color("green")
      ]);
    });

    it("responds well to mutations in the underlying array", () => {
      innerElements.push(
        new Color("green"),
      );

      // the ordering here is intentional.

      // First, check that the index updates.
      expect(proxy[2]).toBe("green");

      // test ownKeys does the right thing
      innerElements.push(new Color("yellow"));
      expect(Reflect.ownKeys(proxy)).toEqual(["0", "1", "2", "3", "length"]);

      innerElements.push(new Color("white"));
      // test length updates without an index lookup or a prototype method
      expect(proxy.length).toBe(5);

      expect(proxy[3]).toBe("yellow");
      expect(proxy[4]).toBe("white");

      expect(proxy[0]).toBe("red");
      expect(proxy[1]).toBe("blue");
    });
  });

  describe("prototype", () => {
    it(".at() works", () => {
      expect(proxy.at(0)).toBe("red");
      expect(proxy.at(1)).toBe("blue");
      expect(proxy.at(2)).toBeUndefined();
    });
  });
});
