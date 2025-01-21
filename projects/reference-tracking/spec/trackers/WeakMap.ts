import { WeakMapTracking } from "../../source/trackers/WeakMap.js";
import { COLLECT_REFERENCES } from "../../source/trackers/utilities/ReferenceDescription.js";

it("WeakMapTracking extends WeakMap with [COLLECT_REFERENCES]", () => {
  const map = new WeakMapTracking<object | symbol, unknown>;
  expect(map[COLLECT_REFERENCES]()).toEqual([]);

  const redCar = {"type": "car", "color": "red"};
  const blueCar = {"type": "car", "color": "blue"};
  const Fred = {"type": "person", "name": "Fred"};
  const Cathy = {"type": "person", "name": "Cathy"};

  map.set(redCar, Fred);
  {
    const refs = map[COLLECT_REFERENCES]();
    expect(refs.length).toBe(2);

    expect(refs[0].jointOwners.size).toBe(1);
    expect(refs[0].jointOwners.has(map)).toBeTrue();
    expect(refs[0].referencedValue).toBe(redCar);
    expect(refs[0].isStrongReference).toBe(false);

    expect(refs[1].jointOwners.size).toBe(2);
    expect(refs[1].jointOwners.has(map)).toBeTrue();
    expect(refs[1].jointOwners.has(redCar)).toBeTrue();
    expect(refs[1].referencedValue).toBe(Fred);
    expect(refs[1].isStrongReference).toBe(false);
  }

  map.set(redCar, Cathy);
  {
    const refs = map[COLLECT_REFERENCES]();
    expect(refs.length).toBe(2);

    expect(refs[0].jointOwners.size).toBe(1);
    expect(refs[0].jointOwners.has(map)).toBeTrue();
    expect(refs[0].referencedValue).toBe(redCar);
    expect(refs[0].isStrongReference).toBe(false);

    expect(refs[1].jointOwners.size).toBe(2);
    expect(refs[1].jointOwners.has(map)).toBeTrue();
    expect(refs[1].jointOwners.has(redCar)).toBeTrue();
    expect(refs[1].referencedValue).toBe(Cathy);
    expect(refs[1].isStrongReference).toBe(false);
  }

  map.set(redCar, false);
  {
    const refs = map[COLLECT_REFERENCES]();
    expect(refs.length).toBe(1);

    expect(refs[0].jointOwners.size).toBe(1);
    expect(refs[0].jointOwners.has(map)).toBeTrue();
    expect(refs[0].referencedValue).toBe(redCar);
    expect(refs[0].isStrongReference).toBe(false);
  }

  map.set(blueCar, Fred);
  {
    const refs = map[COLLECT_REFERENCES]();
    expect(refs.length).toBe(3);

    expect(refs[1].jointOwners.size).toBe(1);
    expect(refs[1].jointOwners.has(map)).toBeTrue();
    expect(refs[1].referencedValue).toBe(blueCar);
    expect(refs[1].isStrongReference).toBe(false);

    expect(refs[2].jointOwners.size).toBe(2);
    expect(refs[2].jointOwners.has(map)).toBeTrue();
    expect(refs[2].jointOwners.has(blueCar)).toBeTrue();
    expect(refs[2].referencedValue).toBe(Fred);
    expect(refs[2].isStrongReference).toBe(false);
  }

  map.delete(blueCar);
  {
    const refs = map[COLLECT_REFERENCES]();
    expect(refs.length).toBe(1);

    expect(refs[0].jointOwners.size).toBe(1);
    expect(refs[0].jointOwners.has(map)).toBeTrue();
    expect(refs[0].referencedValue).toBe(redCar);
    expect(refs[0].isStrongReference).toBe(false);
  }
});
