import { WeakRefTracking } from "../../source/trackers/WeakRef.js";
import { COLLECT_REFERENCES } from "../../source/trackers/utilities/ReferenceDescription.js";

it("WeakRefTracking extends WeakRef with [COLLECT_REFERENCES]", () => {
  const obj = { "type": "car" };
  const weakRef = new WeakRefTracking(obj);

  const refs = weakRef[COLLECT_REFERENCES]();
  expect(refs.length).toBe(1);

  expect(refs[0].collectionName).toBe("WeakRef");
  expect(refs[0].jointOwners.size).toBe(1);
  expect(refs[0].jointOwners.has(weakRef)).toBeTrue();
  expect(refs[0].referencedValue).toBe(obj);
  expect(refs[0].isStrongReference).toBe(false);
  expect(refs[0].contextPrimitives.length).toBe(0);
});
