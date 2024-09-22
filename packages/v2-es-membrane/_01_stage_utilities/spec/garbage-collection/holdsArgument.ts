import holdsArgument from "#stage_utilities/source/gc/holdsArgument.js";

it("holdsArgument demonstrates functions holding an object strongly or weakly", async () => {
  function voidObject(obj: object): void {
    void(obj);
  }

  const setOfObjects = new Set<object>;
  const mapOfObjects = new Map<object, object>;
  const weakMapOfObjects = new WeakMap<object, object>;

  function objectInSet(obj: object): void {
    setOfObjects.add(obj);
  }
  function weakRefValueOfStrongSet(obj: object): void {
    setOfObjects.add(new WeakRef(obj));
  }

  const weakSetOfObjects = new WeakSet<object>;
  function objectInWeakSet(obj: object): void {
    weakSetOfObjects.add(obj);
  }

  function objectKeyOfStrongMap(obj: object): void {
    mapOfObjects.set(obj, {});
  }
  function objectValueOfStrongMap(obj: object): void {
    mapOfObjects.set({}, obj);
  }

  function objectKeyOfWeakMap(obj: object): void {
    weakMapOfObjects.set(obj, {});
  }
  function objectValueOfWeakMap(obj: object): void {
    weakMapOfObjects.set({}, obj);
  }

  function objectValueOfWeakMapWithHeldKey(obj: object): void {
    const key = {};
    setOfObjects.add(key);
    weakMapOfObjects.set(key, obj);
  }

  function objectToWeakRefMap(obj: object): void {
    weakMapOfObjects.set(obj, new WeakRef(obj));
  }

  function objectToWeakRefMapAndStrongSet(obj: object): void {
    objectToWeakRefMap(obj);
    setOfObjects.add(obj);
  }

  function objectToWeakRefMapAndWeakSet(obj: object): void {
    objectToWeakRefMap(obj);
    weakSetOfObjects.add(obj);
  }

  await expectAsync(holdsArgument(10, 10, voidObject)).toBeResolvedTo(false);
  await expectAsync(holdsArgument(10, 10, objectInWeakSet)).toBeResolvedTo(false);
  await expectAsync(holdsArgument(10, 10, objectKeyOfWeakMap)).toBeResolvedTo(false);
  await expectAsync(holdsArgument(10, 10, objectValueOfWeakMap)).toBeResolvedTo(false);
  await expectAsync(holdsArgument(10, 10, weakRefValueOfStrongSet)).toBeResolvedTo(false);
  await expectAsync(holdsArgument(10, 10, objectToWeakRefMap)).toBeResolvedTo(false);

  await expectAsync(holdsArgument(10, 10, objectInSet)).toBeResolvedTo(true);
  await expectAsync(holdsArgument(10, 10, objectKeyOfStrongMap)).toBeResolvedTo(true);
  await expectAsync(holdsArgument(10, 10, objectValueOfStrongMap)).toBeResolvedTo(true);
  await expectAsync(holdsArgument(10, 10, objectValueOfWeakMapWithHeldKey)).toBeResolvedTo(true);

  // All it takes is one strong reference.
  await expectAsync(holdsArgument(10, 10, objectToWeakRefMapAndStrongSet)).toBeResolvedTo(true);
  await expectAsync(holdsArgument(10, 10, objectToWeakRefMapAndWeakSet)).toBeResolvedTo(false);
});
