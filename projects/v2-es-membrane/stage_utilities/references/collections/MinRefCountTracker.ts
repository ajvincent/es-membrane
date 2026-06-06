import {
  MinRefCountTracker
} from "../../source/collections/MinRefCountTracker.js";

declare const WeakKeyBranding: unique symbol;
type ValueBranded = symbol & { [WeakKeyBranding]: "value" };
type SharedKeyBranded = symbol & { [WeakKeyBranding]: "shared" };

function callback(sharedKey: SharedKeyBranded, strongKeySet: ReadonlySet<string>): void {
  void sharedKey;
  for (const strongKey of strongKeySet) {
    const value: ValueBranded = keyToValueMap.get(strongKey)!;
    tracker.deleteReference(value, false);
  }
}
const tracker = new MinRefCountTracker<SharedKeyBranded, string, ValueBranded>(2, callback);

const shared = Symbol("shared key") as SharedKeyBranded;
const redValue = Symbol("red value") as ValueBranded;
const blueValue = Symbol("blue value") as ValueBranded;
const greenValue = Symbol("green value") as ValueBranded;

const keyToValueMap = new Map<string, ValueBranded>([
  [ "red", redValue ],
  [ "blue", blueValue ],
  [ "green", greenValue ]
]);
tracker.addReference(shared, "red", redValue);
tracker.addReference(shared, "blue", blueValue);
tracker.addReference(shared, "green", greenValue);

searchReferences("shared before deleting references", shared, [tracker], true);
searchReferences("redValue before deleting references", redValue, [tracker], true);
// not bothering with blueValue or greenValue: they're of the same shape

keyToValueMap.delete("green");
tracker.deleteReference(greenValue, true);
// not enough to trigger the callback

searchReferences("shared after deleting greenValue", shared, [tracker], true);
searchReferences("redValue after deleting greenValue", redValue, [tracker], true);

keyToValueMap.delete("blue");
tracker.deleteReference(blueValue, true);
searchReferences("shared after deleting blueValue", shared, [tracker], true);
searchReferences("redValue after deleting blueValue", redValue, [tracker], true);
