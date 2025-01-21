import { MapTracking } from "../../source/trackers/Map.js";
import { COLLECT_REFERENCES } from "../../source/trackers/utilities/ReferenceDescription.js";

it("WeakMapTracking extends WeakMap with [COLLECT_REFERENCES]", () => {
  let map = new MapTracking<unknown, unknown>;
  expect(map[COLLECT_REFERENCES]()).toEqual([]);

  const redCar = {"type": "car", "color": "red"};
  const blueCar = "blue car";
  const Fred = {"type": "person", "name": "Fred"};
  const Cathy = "Cathy";

  map.set(redCar, Fred);
  {
    const refs = map[COLLECT_REFERENCES]();
    expect(refs.length).toBe(2);

    expect(refs[0].collectionName).toBe("Map");
    expect(refs[0].jointOwners.size).toBe(1);
    expect(refs[0].jointOwners.has(map)).toBeTrue();
    expect(refs[0].referencedValue).toBe(redCar);
    expect(refs[0].isStrongReference).toBe(true);
    expect(refs[0].contextPrimitives).toEqual([]);

    expect(refs[1].collectionName).toBe("Map");
    expect(refs[1].jointOwners.size).toBe(2);
    expect(refs[1].jointOwners.has(map)).toBeTrue();
    expect(refs[1].jointOwners.has(redCar)).toBeTrue();
    expect(refs[1].referencedValue).toBe(Fred);
    expect(refs[1].isStrongReference).toBe(true);
    expect(refs[1].contextPrimitives).toEqual([]);
  }

  map.set(redCar, Cathy);
  {
    const refs = map[COLLECT_REFERENCES]();
    expect(refs.length).toBe(1);

    expect(refs[0].collectionName).toBe("Map");
    expect(refs[0].jointOwners.size).toBe(1);
    expect(refs[0].jointOwners.has(map)).toBeTrue();
    expect(refs[0].referencedValue).toBe(redCar);
    expect(refs[0].isStrongReference).toBe(true);
    expect(refs[0].contextPrimitives).toEqual([]);
  }

  map.set(redCar, false);
  {
    const refs = map[COLLECT_REFERENCES]();
    expect(refs.length).toBe(1);

    expect(refs[0].collectionName).toBe("Map");
    expect(refs[0].jointOwners.size).toBe(1);
    expect(refs[0].jointOwners.has(map)).toBeTrue();
    expect(refs[0].referencedValue).toBe(redCar);
    expect(refs[0].isStrongReference).toBe(true);
    expect(refs[0].contextPrimitives).toEqual([]);
  }

  map.set(blueCar, Fred);
  {
    const refs = map[COLLECT_REFERENCES]();
    expect(refs.length).toBe(2);

    expect(refs[0].collectionName).toBe("Map");
    expect(refs[0].jointOwners.size).toBe(1);
    expect(refs[0].jointOwners.has(map)).toBeTrue();
    expect(refs[0].referencedValue).toBe(redCar);
    expect(refs[0].isStrongReference).toBe(true);
    expect(refs[0].contextPrimitives).toEqual([]);

    expect(refs[1].collectionName).toBe("Map");
    expect(refs[1].jointOwners.size).toBe(1);
    expect(refs[1].jointOwners.has(map)).toBeTrue();
    expect(refs[1].contextPrimitives.includes(blueCar)).toBeTrue();
    expect(refs[1].referencedValue).toBe(Fred);
    expect(refs[1].isStrongReference).toBe(true);
    expect(refs[1].contextPrimitives).toEqual([blueCar]);
  }

  map.delete(blueCar);
  {
    const refs = map[COLLECT_REFERENCES]();
    expect(refs.length).toBe(1);

    expect(refs[0].collectionName).toBe("Map");
    expect(refs[0].jointOwners.size).toBe(1);
    expect(refs[0].jointOwners.has(map)).toBeTrue();
    expect(refs[0].referencedValue).toBe(redCar);
    expect(refs[0].isStrongReference).toBe(true);
    expect(refs[0].contextPrimitives).toEqual([]);
  }

  map = new MapTracking([
    [redCar, Fred]
  ]);
  {
    const refs = map[COLLECT_REFERENCES]();
    expect(refs.length).toBe(2);

    expect(refs[0].collectionName).toBe("Map");
    expect(refs[0].jointOwners.size).toBe(1);
    expect(refs[0].jointOwners.has(map)).toBeTrue();
    expect(refs[0].referencedValue).toBe(redCar);
    expect(refs[0].isStrongReference).toBe(true);
    expect(refs[0].contextPrimitives).toEqual([]);

    expect(refs[1].collectionName).toBe("Map");
    expect(refs[1].jointOwners.size).toBe(2);
    expect(refs[1].jointOwners.has(map)).toBeTrue();
    expect(refs[1].jointOwners.has(redCar)).toBeTrue();
    expect(refs[1].referencedValue).toBe(Fred);
    expect(refs[1].isStrongReference).toBe(true);
    expect(refs[1].contextPrimitives).toEqual([]);
  }
});
