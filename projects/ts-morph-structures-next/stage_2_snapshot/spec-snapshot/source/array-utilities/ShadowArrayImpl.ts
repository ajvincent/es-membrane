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

    protected [BUILD_ARRAY_WRAPPER](...innerElements: Color[]): string[] {
      return ColorArray.createProxy(innerElements);
    }

    protected [CONVERT_OUTER_TO_INNER](outerType: string): Color {
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
      innerElements.push(new Color("green"));
      // This test means any method which updates the innerElements array will
      // thus reflect its changes in the proxy.

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
    it("[Symbol.iterator]() works", () => {
      const iter = proxy[Symbol.iterator]();
      expect(iter.next()).toEqual({ value: "red", done: false});
      expect(iter.next()).toEqual({ value: "blue", done: false });
      expect(iter.next()).toEqual({ value: undefined, done: true });

      // this is one of the most common uses of `Symbol.iterator`
      // and thus enables a lot of later tests
      expect(Array.from(proxy)).toEqual(["red", "blue"]);
    });

    it(".at() works", () => {
      expect(proxy.at(0)).toBe("red");
      expect(proxy.at(1)).toBe("blue");
      expect(proxy.at(2)).toBeUndefined();
    });

    it(".pop() works", () => {
      expect(proxy.pop()).toEqual("blue");
      expect(Array.from(proxy)).toEqual(["red"]);

      expect(proxy.pop()).toEqual("red");
      expect(Array.from(proxy)).toEqual([]);

      expect(proxy.pop()).toBeUndefined();
      expect(proxy.length).toBe(0);
    });

    it(".push() works", () => {
      expect(proxy.push("green")).toEqual(3);
      expect(Array.from(proxy)).toEqual(["red", "blue", "green"]);
    });

    it(".concat() works", () => {
      const newProxy: string[] = proxy.concat("green", "yellow");
      expect(Array.from(newProxy)).toEqual(["red", "blue", "green", "yellow"]);
      expect(Array.from(proxy)).toEqual(["red", "blue"]);
    });

    it(".join() works", () => {
      innerElements.push(new Color("green"));
      expect(proxy.join("X")).toBe("redXblueXgreen");
    });

    it(".reverse() works", () => {
      innerElements.push(new Color("green"));
      const ref = proxy.reverse();
      expect(ref === proxy).toBeTrue();

      expect(innerElements).toEqual([new Color("green"), new Color("blue"), new Color("red")]);
      expect(Array.from(proxy)).toEqual(["green", "blue", "red"]);
    });

    it(".shift() works", () => {
      innerElements.push(new Color("green"));
      expect(proxy.shift()).toBe("red");
      expect(Array.from(proxy)).toEqual(["blue", "green"]);
    });

    it(".slice() works", () => {
      innerElements.push(new Color("green"), new Color("yellow"));
      const newProxy: string[] = proxy.slice(1, 3);
      expect(Array.from(newProxy)).toEqual(["blue", "green"]);
      expect(Array.from(proxy)).toEqual(["red", "blue", "green", "yellow"]);
    });

    it(".sort() works", () => {
      innerElements.push(new Color("green"), new Color("yellow"));
      let ref = proxy.sort((a: string, b: string): number => {
        if (a === "yellow")
          return -1;
        if (b === "yellow")
          return +1;
        return a.localeCompare(b);
      });
      expect(ref === proxy).toBeTrue();
      expect(Array.from(proxy)).toEqual(["yellow", "blue", "green", "red"]);

      innerElements.reverse();
      ref = proxy.sort();
      expect(ref === proxy).toBeTrue();
      expect(Array.from(proxy)).toEqual(["blue", "green", "red", "yellow"]);
    });

    it(".splice() works", () => {
      innerElements.push(new Color("green"), new Color("yellow"));
      const newProxy = proxy.splice(1, 2, "white", "purple");

      expect(Array.from(newProxy)).toEqual(["blue", "green"]);
      expect(Array.from(proxy)).toEqual(["red", "white", "purple", "yellow"]);
    });

    it(".unshift() works", () => {
      proxy.unshift("green", "yellow");
      expect(Array.from(proxy)).toEqual(["green", "yellow", "red", "blue"]);
    });

    it("indexOf() works", () => {
      proxy.push("red");
      expect(proxy.indexOf("red")).toBe(0);
      expect(proxy.indexOf("blue")).toBe(1);
      expect(proxy.indexOf("green")).toBe(-1);
    });

    it("lastIndexOf() works", () => {
      proxy.push("red");
      expect(proxy.lastIndexOf("red")).toBe(2);
      expect(proxy.lastIndexOf("blue")).toBe(1);
      expect(proxy.lastIndexOf("green")).toBe(-1);
    });

    it("every() works", () => {
      proxy.push("green", "yellow");
      expect(proxy.every(v => v.includes("e"))).toBeTrue();

      proxy.push("pink");
      expect(proxy.every(v => v.includes("e"))).toBeFalse();
    });

    it("some() works", () => {
      expect(proxy.some(v => v.includes("k"))).toBeFalse();

      proxy.push("pink");
      expect(proxy.some(v => v.includes("k"))).toBeTrue();
    });

    it("forEach() works", () => {
      const items: [string, number][] = [];

      proxy.push("pink");
      proxy.forEach((value, index) => {
        items.push([value, index]);
      });

      expect(items).toEqual([["red", 0], ["blue", 1], ["pink", 2]]);
    });

    it("map() works", () => {
      const newColors = proxy.map(c => new Color(c));
      expect(newColors).toEqual([new Color("red"), new Color("blue")]);
    });

    it("filter() works", () => {
      proxy.splice(1, 0, "pink");
      const filtered = proxy.filter((value => value.includes("e")));
      expect(Array.from(filtered)).toEqual(["red", "blue"]);
    });

    it(".reduce() works", () => {
      proxy.push("green", "yellow");

      const actual = proxy.reduce(
        (prev, current) => prev.length > current.length ? prev : current
      );
      expect(actual).toBe("yellow");
    });

    it(".reduceRight() works", () => {
      proxy.push("green", "yellow");
      proxy.shift();

      const actual = proxy.reduceRight(
        (prev, current) => prev.length < current.length ? prev : current
      );
      expect(actual).toBe("blue");
    });

    it(".find() works", () => {
      proxy.push("white");

      expect(proxy.find(
        (value) => value.endsWith("e")
      )).toBe("blue");

      expect(proxy.find(
        value => value.endsWith("x")
      )).toBeUndefined();
    });

    it(".findIndex() works", () => {
      proxy.push("white");

      expect(proxy.findIndex(
        (value) => value.endsWith("e")
      )).toBe(1);

      expect(proxy.findIndex(
        (value) => value.endsWith("x")
      )).toBe(-1);
    });

    it("fill works", () => {
      proxy.push("green", "yellow");

      const ref = proxy.fill("white", 1, 3);
      expect(ref === proxy).toBeTrue();
      expect(Array.from(proxy)).toEqual(["red", "white", "white", "yellow"]);
    });

    it("copyWithin works", () => {
      proxy.push("green", "purple", "yellow", "white", "orange", "black");

      const ref = proxy.copyWithin(1, 3, 5);
      expect(ref === proxy).toBeTrue();
      expect(Array.from(proxy)).toEqual([
        "red", "purple", "yellow", "purple", "yellow", "white", "orange", "black"
      ]);
    });
  });
});
