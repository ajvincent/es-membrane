import OneToOneStrongMap from "../fixtures/OneToOneStrongMap/OneToOneStrongMap.js";

class DummyMembrane {
  static #INTERNAL_KEY = Symbol("Internal object graph");

  #map = new OneToOneStrongMap<string | symbol, object[]>;

  addArray(firstKey: string, firstArray: object[], secondKey: string, secondArray: object[]): void {
    if (!this.#map.has(firstArray, firstKey)) {
      const internalArray = [];
      for (let index = 0; index < firstArray.length; index++) {
        internalArray.push({});
      }

      /* Now, here's where things might go wrong.  The internal key isn't supposed to be
      something we hold objects for.  But the OneToOneStrongMap has no way of knowing
      this...
      */
      this.#map.bindOneToOne(firstKey, firstArray, DummyMembrane.#INTERNAL_KEY, internalArray);
    }

    this.#map.bindOneToOne(firstKey, firstArray, secondKey, secondArray);
  }
}

{
  const membrane = new DummyMembrane;

  const redArray = [ { isRedObject: true} ];
  const blueArray = [ { isBlueObject: true } ];

  const { proxy: redArrayProxy, revoke: redArrayRevoke } = Proxy.revocable(redArray, Reflect);

  membrane.addArray("red", redArrayProxy as object[], "blue", blueArray);

  const redOwner = [ redArray ];
  const blueOwner = [ blueArray ];
  const { proxy: redOwnerProxy, revoke: redOwnerRevoke } = Proxy.revocable(redOwner, Reflect);
  membrane.addArray("red", redOwnerProxy as object[], "blue", blueOwner);

  /* redArray should still be reachable:
  - the OneToOneStrongMap bound the blue objects to red proxies.
  - the red proxies pointed to the red objects.
  */
  searchReferences("proxied redArray via blueOwner", redArray, [membrane, blueOwner], true);

  redArrayRevoke();
  redOwnerRevoke();

  /* This time the answer should be no:
  - we revoked the proxies, so the red objects aren't reachable that way.
  */
  searchReferences("revoked redArray via blueOwner", redArray, [membrane, blueOwner], true);

  /* but did we clean up the proxies? */
  searchReferences("redArrayProxy via blueOwner", redArrayProxy, [membrane, blueOwner], true);
  searchReferences("redOwnerProxy via blueOwner", redOwnerProxy, [membrane, blueOwner], true);
}
