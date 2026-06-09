import {
  MinRefCountTracker,
  type RefCountTrackerCallback,
} from "../../source/collections/MinRefCountTracker.js";

import type {
  PrivateKeyBranded,
  SharedKeyBranded
} from "../../source/collections/KeysBranded.js";

it("MinRefCountTracker reports when we drop below a certain threshold of strong keys", () => {
  const spy = jasmine.createSpy<RefCountTrackerCallback<string>>();
  const tracker = new MinRefCountTracker<string>(4, spy);

  expect(spy).toHaveBeenCalledTimes(0);

  const sharedKey = Symbol("shared key") as SharedKeyBranded;

  const foods: Record<string, PrivateKeyBranded> = {
    ravioli: Symbol("ravioli") as PrivateKeyBranded,
    salad: Symbol("salad") as PrivateKeyBranded,
    friedrice: Symbol("fried rice") as PrivateKeyBranded,
    pizza: Symbol("pizza") as PrivateKeyBranded,
    steak: Symbol("steak") as PrivateKeyBranded,
    potatoes: Symbol("potatoes") as PrivateKeyBranded,
    cauliflower: Symbol("cauliflower") as PrivateKeyBranded,
  };

  tracker.addReference(foods.ravioli, sharedKey, "red");
  tracker.addReference(foods.salad, sharedKey, "blue");
  tracker.addReference(foods.friedrice, sharedKey, "green");

  // time to test for exceptions
  expect(
    () => {
      tracker.addReference(foods.pizza, sharedKey, "red");
    }
  ).toThrowError("strong key already known");

  tracker.addReference(foods.pizza, sharedKey, "yellow");
  tracker.addReference(foods.steak, sharedKey, "orange");
  tracker.addReference(foods.potatoes, sharedKey, "purple");

  expect(spy).toHaveBeenCalledTimes(0);

  tracker.deleteReference(foods.salad, true); // 5 values left
  expect(spy).toHaveBeenCalledTimes(0);

  tracker.deleteReference(foods.friedrice, true); // 4 values left, the minimum
  expect(spy).toHaveBeenCalledTimes(0);

  tracker.addReference(foods.cauliflower, sharedKey, "white");
  expect(spy).toHaveBeenCalledTimes(0);

  tracker.deleteReference(foods.potatoes, true); // back to 4 values
  expect(spy).toHaveBeenCalledTimes(0);

  tracker.deleteReference(foods.pizza, true);
  expect(spy).toHaveBeenCalledTimes(1);
  const [
    weakKey,
    remainingStrongKeys
  ]: [SharedKeyBranded, ReadonlySet<string>] = spy.calls.argsFor(0);
  expect(weakKey).toBe(sharedKey);
  expect(Array.from(remainingStrongKeys)).toEqual([
    "red", "orange", "white"
  ]);

  spy.calls.reset();

  // simulating garbage collection of the other values
  tracker.deleteReference(foods.steak, true);
  expect(spy).toHaveBeenCalledTimes(0);

  // after the callback fires, this is what we should be calling
  tracker.deleteReference(foods.cauliflower, false);
  expect(spy).toHaveBeenCalledTimes(0);
});
