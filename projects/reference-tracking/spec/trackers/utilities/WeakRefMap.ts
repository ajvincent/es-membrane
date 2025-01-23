import { WeakRefMap } from "../../../source/trackers/utilities/WeakRefMap.js";

it("WeakRefMap works like a Map, except for .size()", () => {
  interface Car {
    type: "car";
    color: string;
  }
  interface Person {
    type: "person",
    name: string;
  }
  let map = new WeakRefMap<Car, Person>;

  const redCar: Car = {"type": "car", "color": "red"};
  const blueCar: Car = {"type": "car", "color": "blue"};
  const Fred: Person = {"type": "person", "name": "Fred"};
  const Cathy: Person = {"type": "person", "name": "Cathy"};

  const thisArg = {};
  const spy = jasmine.createSpy();

  map.set(redCar, Fred);
  {
    expect(map.has(redCar)).toBe(true);
    expect(map.get(redCar)).toBe(Fred);
    expect(Array.from(map.entries())).toEqual([[redCar, Fred]]);
    expect(Array.from(map.keys())).toEqual([redCar]);
    expect(Array.from(map.values())).toEqual([Fred]);
    expect(Array.from(map)).toEqual([[redCar, Fred]]);

    map.forEach(spy, thisArg);
    expect(spy).toHaveBeenCalledOnceWith(Fred, redCar, map);
    expect(spy.calls.thisFor(0)).toBe(thisArg);
  }
  spy.calls.reset();

  map.set(redCar, Cathy);
  {
    expect(map.has(redCar)).toBe(true);
    expect(map.get(redCar)).toBe(Cathy);
    expect(Array.from(map.entries())).toEqual([[redCar, Cathy]]);
    expect(Array.from(map.keys())).toEqual([redCar]);
    expect(Array.from(map.values())).toEqual([Cathy]);
    expect(Array.from(map)).toEqual([[redCar, Cathy]]);

    map.forEach(spy, thisArg);
    expect(spy).toHaveBeenCalledOnceWith(Cathy, redCar, map);
    expect(spy.calls.thisFor(0)).toBe(thisArg);
  }
  spy.calls.reset();

  map.set(blueCar, Fred);
  {
    expect(map.has(redCar)).toBe(true);
    expect(map.get(redCar)).toBe(Cathy);

    expect(map.has(blueCar)).toBe(true);
    expect(map.get(blueCar)).toBe(Fred);

    expect(Array.from(map.entries())).toEqual([[redCar, Cathy], [blueCar, Fred]]);
    expect(Array.from(map.keys())).toEqual([redCar, blueCar]);
    expect(Array.from(map.values())).toEqual([Cathy, Fred]);
    expect(Array.from(map)).toEqual([[redCar, Cathy], [blueCar, Fred]]);

    map.forEach(spy, thisArg);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.calls.argsFor(0)).toEqual([Cathy, redCar, map]);
    expect(spy.calls.thisFor(0)).toBe(thisArg);
    expect(spy.calls.argsFor(1)).toEqual([Fred, blueCar, map]);
    expect(spy.calls.thisFor(1)).toBe(thisArg);
  }
  spy.calls.reset();

  map.delete(blueCar);
  {
    expect(map.has(redCar)).toBe(true);
    expect(map.get(redCar)).toBe(Cathy);

    expect(map.has(blueCar)).toBeFalse();
    expect(map.get(blueCar)).toBeUndefined();

    expect(Array.from(map.entries())).toEqual([[redCar, Cathy]]);
    expect(Array.from(map.keys())).toEqual([redCar]);
    expect(Array.from(map.values())).toEqual([Cathy]);
    expect(Array.from(map)).toEqual([[redCar, Cathy]]);

    map.forEach(spy, thisArg);
    expect(spy).toHaveBeenCalledOnceWith(Cathy, redCar, map);
    expect(spy.calls.thisFor(0)).toBe(thisArg);
  }
  spy.calls.reset();

  map.clear();
  {
    expect(map.has(redCar)).toBeFalse()
    expect(map.get(redCar)).toBeUndefined();

    expect(map.has(blueCar)).toBeFalse();
    expect(map.get(blueCar)).toBeUndefined();

    expect(Array.from(map.entries())).toEqual([]);
    expect(Array.from(map.keys())).toEqual([]);
    expect(Array.from(map.values())).toEqual([]);
    expect(Array.from(map)).toEqual([]);

    map.forEach(spy, thisArg);
    expect(spy).toHaveBeenCalledTimes(0)
  }
  spy.calls.reset();

  map = new WeakRefMap<Car, Person>([
    [redCar, Fred]
  ]);
  {
    expect(map.has(redCar)).toBe(true);
    expect(map.get(redCar)).toBe(Fred);
    expect(Array.from(map.entries())).toEqual([[redCar, Fred]]);
    expect(Array.from(map.keys())).toEqual([redCar]);
    expect(Array.from(map.values())).toEqual([Fred]);
    expect(Array.from(map)).toEqual([[redCar, Fred]]);

    map.forEach(spy, thisArg);
    expect(spy).toHaveBeenCalledOnceWith(Fred, redCar, map);
    expect(spy.calls.thisFor(0)).toBe(thisArg);
  }
  spy.calls.reset();
});
