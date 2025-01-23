import { WeakSetTracking } from "../../source/trackers/WeakSet.js";
import { COLLECT_REFERENCES } from "../../source/trackers/utilities/ReferenceDescription.js";

it("WeakSetTracking extends WeakSet with [COLLECT_REFERENCES]", () => {
  let set = new WeakSetTracking<WeakKey>;
  expect(set[COLLECT_REFERENCES]()).toEqual([]);

  const redCar = {"type": "car", "color": "red"};
  const blueCar = {"type": "car", "color": "blue"};

  set.add(redCar);
  {
    const refs = set[COLLECT_REFERENCES]();
    expect(refs.length).toBe(1);

    expect(refs[0].collectionName).toBe("WeakSet");
    expect(refs[0].jointOwners.size).toBe(1);
    expect(refs[0].jointOwners.has(set)).toBeTrue();
    expect(refs[0].referencedValue).toBe(redCar);
    expect(refs[0].isStrongReference).toBe(false);
    expect(refs[0].contextPrimitives.length).toBe(0);
  }

  set.add(blueCar);
  {
    const refs = set[COLLECT_REFERENCES]();
    expect(refs.length).toBe(2);

    expect(refs[0].collectionName).toBe("WeakSet");
    expect(refs[0].contextPrimitives.length).toBe(0);

    expect(refs[1].collectionName).toBe("WeakSet");
    expect(refs[1].jointOwners.size).toBe(1);
    expect(refs[1].jointOwners.has(set)).toBeTrue();
    expect(refs[1].referencedValue).toBe(blueCar);
    expect(refs[1].isStrongReference).toBe(false);
    expect(refs[1].contextPrimitives.length).toBe(0);
  }

  set.delete(blueCar);
  {
    const refs = set[COLLECT_REFERENCES]();
    expect(refs.length).toBe(1);

    expect(refs[0].collectionName).toBe("WeakSet");
    expect(refs[0].jointOwners.size).toBe(1);
    expect(refs[0].jointOwners.has(set)).toBeTrue();
    expect(refs[0].referencedValue).toBe(redCar);
    expect(refs[0].isStrongReference).toBe(false);
    expect(refs[0].contextPrimitives.length).toBe(0);
  }

  set = new WeakSetTracking<WeakKey>([
    redCar
  ]);
  {
    const refs = set[COLLECT_REFERENCES]();
    expect(refs.length).toBe(1);

    expect(refs[0].collectionName).toBe("WeakSet");
    expect(refs[0].jointOwners.size).toBe(1);
    expect(refs[0].jointOwners.has(set)).toBeTrue();
    expect(refs[0].referencedValue).toBe(redCar);
    expect(refs[0].isStrongReference).toBe(false);
    expect(refs[0].contextPrimitives.length).toBe(0);
  }
});
