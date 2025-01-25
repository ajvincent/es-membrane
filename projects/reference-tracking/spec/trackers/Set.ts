import { SetTracking } from "../../source/mockups/Set.js";
import { COLLECT_REFERENCES } from "../../source/mockups/utilities/ReferenceDescription.js";

it("SetTracking extends Set with [COLLECT_REFERENCES]", () => {
  let set = new SetTracking<unknown>;
  expect(set[COLLECT_REFERENCES]()).toEqual([]);

  const redCar = {"type": "car", "color": "red"};
  const blueCar = "blue car";

  set.add(redCar);
  {
    const refs = set[COLLECT_REFERENCES]();
    expect(refs.length).toBe(1);

    expect(refs[0].collectionName).toBe("Set");
    expect(refs[0].jointOwners.size).toBe(1);
    expect(refs[0].jointOwners.has(set)).toBeTrue();
    expect(refs[0].referencedValue).toBe(redCar);
    expect(refs[0].isStrongReference).toBe(true);
    expect(refs[0].contextPrimitives).toEqual([]);
  }

  set.add(blueCar);
  {
    const refs = set[COLLECT_REFERENCES]();
    expect(refs.length).toBe(1);

    expect(refs[0].collectionName).toBe("Set");
    expect(refs[0].jointOwners.size).toBe(1);
    expect(refs[0].jointOwners.has(set)).toBeTrue();
    expect(refs[0].referencedValue).toBe(redCar);
    expect(refs[0].isStrongReference).toBe(true);
    expect(refs[0].contextPrimitives).toEqual([]);
  }

  set.delete(redCar);
  {
    const refs = set[COLLECT_REFERENCES]();
    expect(refs.length).toBe(0);
  }

  set = new SetTracking([
    redCar
  ]);
  {
    const refs = set[COLLECT_REFERENCES]();
    expect(refs.length).toBe(1);

    expect(refs[0].collectionName).toBe("Set");
    expect(refs[0].jointOwners.size).toBe(1);
    expect(refs[0].jointOwners.has(set)).toBeTrue();
    expect(refs[0].referencedValue).toBe(redCar);
    expect(refs[0].isStrongReference).toBe(true);
    expect(refs[0].contextPrimitives).toEqual([]);
  }
});
