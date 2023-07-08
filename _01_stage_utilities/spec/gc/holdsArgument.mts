import holdsArgument from "#stage_utilities/source/gc/holdsArgument.mjs";

it("holdsArgument demonstrates functions holding an object strongly or weakly", async () => {
  function voidObject(obj: object): void {
    void(obj);
  }

  const setOfObjects = new Set<object>;
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

  const mapOfObjects = new Map<object, object>;
  function objectKeyOfStrongMap(obj: object): void {
    mapOfObjects.set(obj, {});
  }
  function objectValueOfStrongMap(obj: object): void {
    mapOfObjects.set({}, obj);
  }

  const weakMapOfObjects = new WeakMap<object, object>;
  function objectKeyOfWeakMap(obj: object): void {
    weakMapOfObjects.set(obj, {});
  }
  function objectValueOfWeakMap(obj: object): void {
    weakMapOfObjects.set({}, obj);
  }

  await expectAsync(holdsArgument(10, 10, voidObject)).toBeResolvedTo(false);
  await expectAsync(holdsArgument(10, 10, objectInWeakSet)).toBeResolvedTo(false);
  await expectAsync(holdsArgument(10, 10, objectKeyOfWeakMap)).toBeResolvedTo(false);
  await expectAsync(holdsArgument(10, 10, objectValueOfWeakMap)).toBeResolvedTo(false);
  await expectAsync(holdsArgument(10, 10, weakRefValueOfStrongSet)).toBeResolvedTo(false);

  await expectAsync(holdsArgument(10, 10, objectInSet)).toBeResolvedTo(true);
  await expectAsync(holdsArgument(10, 10, objectKeyOfStrongMap)).toBeResolvedTo(true);
  await expectAsync(holdsArgument(10, 10, objectValueOfStrongMap)).toBeResolvedTo(true);
});
