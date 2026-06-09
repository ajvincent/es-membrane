import {
  MinRefCountTracker
} from "../../source/collections/MinRefCountTracker.js";

import type {
  PrivateKeyBranded,
  SharedKeyBranded
} from "../../source/collections/KeysBranded.js";


function callback(sharedKey: SharedKeyBranded, strongKeySet: ReadonlySet<string>): void {
  void sharedKey;
  for (const strongKey of strongKeySet) {
    const value: PrivateKeyBranded = strongKeyToPrivateKeyMap.get(strongKey)!;
    tracker.deleteReference(value, false);
  }
}
const tracker = new MinRefCountTracker<string>(2, callback);

const shared = Symbol("shared key") as SharedKeyBranded;
const redKey = Symbol("red private key") as PrivateKeyBranded;
const blueKey = Symbol("blue private key") as PrivateKeyBranded;
const greenKey = Symbol("green private key") as PrivateKeyBranded;

const strongKeyToPrivateKeyMap = new Map<string, PrivateKeyBranded>([
  [ "red", redKey ],
  [ "blue", blueKey ],
  [ "green", greenKey ]
]);
tracker.addReference(redKey, shared, "red");
tracker.addReference(blueKey, shared, "blue");
tracker.addReference(greenKey, shared, "green");

searchReferences("shared before deleting references", shared, [tracker], true);
searchReferences("redValue before deleting references", redKey, [tracker], true);
// not bothering with blueValue or greenValue: they're of the same shape

strongKeyToPrivateKeyMap.delete("green");
tracker.deleteReference(greenKey, true);
// not enough to trigger the callback

searchReferences("shared after deleting greenValue", shared, [tracker], true);
searchReferences("redValue after deleting greenValue", redKey, [tracker], true);

strongKeyToPrivateKeyMap.delete("blue");
tracker.deleteReference(blueKey, true);
searchReferences("shared after deleting blueValue", shared, [tracker], true);
searchReferences("redValue after deleting blueValue", redKey, [tracker], true);
