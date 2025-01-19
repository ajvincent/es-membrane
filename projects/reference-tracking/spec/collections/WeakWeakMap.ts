import WeakWeakMap from "../../source/collections/WeakWeakMap.js";

it("WeaKWeakMap is a two-keyed weak map", async () => {
  //#region preamble
  class ColorType {
    readonly color: string;
    constructor(color: string) {
      this.color = color;
    }
  }

  class ShapeType {
    readonly shape: string;
    constructor(shape: string) {
      this.shape = shape;
    }
  }

  const red = new ColorType("red");
  const blue = new ColorType("blue");
  const cube = new ShapeType("cube");
  const sphere = new ShapeType("sphere");

  const redCube1 = Symbol("red cube 1");
  const redCube2 = Symbol("red cube two");
  const blueCube = Symbol("blue cube");
  const redSphere = Symbol("red sphere");
  //#endregion preamble

  const map = new WeakWeakMap<ColorType, ShapeType, symbol>;
  expect(map.has(red, cube)).toBe(false);
  expect(map.delete(red, cube)).toBe(false);
  expect(map.get(red, cube)).toBeUndefined();

  expect(map.set(red, cube, redCube1)).toBe(map);
  expect(map.has(red, cube)).toBe(true);
  expect(map.get(red, cube)).toBe(redCube1);

  expect(map.delete(red, cube)).toBe(true);
  expect(map.has(red, cube)).toBe(false);
  expect(map.delete(red, cube)).toBe(false);
  expect(map.get(red, cube)).toBeUndefined();

  expect(map.set(red, cube, redCube1)).toBe(map);
  expect(map.has(red, cube)).toBe(true);
  expect(map.get(red, cube)).toBe(redCube1);

  expect(map.has(red, sphere)).toBe(false);
  expect(map.delete(red, sphere)).toBe(false);
  expect(map.get(red, sphere)).toBeUndefined();

  expect(map.set(red, sphere, redSphere)).toBe(map);
  expect(map.get(red, cube)).toBe(redCube1);
  expect(map.get(red, sphere)).toBe(redSphere);

  expect(map.set(blue, cube, blueCube)).toBe(map);
  expect(map.get(red, cube)).toBe(redCube1);
  expect(map.get(red, sphere)).toBe(redSphere);
  expect(map.get(blue, cube)).toBe(blueCube);
  expect(map.get(blue, sphere)).toBeUndefined();

  expect(map.set(red, cube, redCube2)).toBe(map);
  expect(map.get(red, cube)).toBe(redCube2);
  expect(map.get(red, sphere)).toBe(redSphere);
  expect(map.get(blue, cube)).toBe(blueCube);
  expect(map.get(blue, sphere)).toBeUndefined();
});
