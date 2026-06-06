import {
  MinRefCountTracker,
  type RefCountTrackerCallback,
} from "../../source/collections/MinRefCountTracker.js";

declare const WeakKeyBranding: unique symbol;
type ValueBranded = symbol & { [WeakKeyBranding]: "value" };
type SharedKeyBranded = symbol & { [WeakKeyBranding]: "shared" };

it("MinRefCountTracker reports when we drop below a certain threshold of strong keys", () => {
  const spy = jasmine.createSpy<RefCountTrackerCallback<SharedKeyBranded, string>>();
  const tracker = new MinRefCountTracker<SharedKeyBranded, string, ValueBranded>(4, spy);

  expect(spy).toHaveBeenCalledTimes(0);

  const sharedKey = Symbol("shared key") as SharedKeyBranded;

  const foods: Record<string, ValueBranded> = {
    ravioli: Symbol("ravioli") as ValueBranded,
    salad: Symbol("salad") as ValueBranded,
    friedrice: Symbol("fried rice") as ValueBranded,
    pizza: Symbol("pizza") as ValueBranded,
    steak: Symbol("steak") as ValueBranded,
    potatoes: Symbol("potatoes") as ValueBranded,
    cauliflower: Symbol("cauliflower") as ValueBranded,
  };

  tracker.addReference(sharedKey, "red", foods.ravioli);
  tracker.addReference(sharedKey, "blue", foods.salad);
  tracker.addReference(sharedKey, "green", foods.friedrice);

  // time to test for exceptions
  expect(
    () => {
      tracker.addReference(sharedKey, "red", foods.pizza);
    }
  ).toThrowError("strong key already known");

  tracker.addReference(sharedKey, "yellow", foods.pizza);
  tracker.addReference(sharedKey, "orange", foods.steak);
  tracker.addReference(sharedKey, "purple", foods.potatoes);

  expect(spy).toHaveBeenCalledTimes(0);

  tracker.deleteReference(foods.salad, true); // 5 values left
  expect(spy).toHaveBeenCalledTimes(0);

  tracker.deleteReference(foods.friedrice, true); // 4 values left, the minimum
  expect(spy).toHaveBeenCalledTimes(0);

  tracker.addReference(sharedKey, "white", foods.cauliflower);
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
