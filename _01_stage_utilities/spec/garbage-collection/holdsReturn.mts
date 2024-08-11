import holdsReturn from "#stage_utilities/source/gc/holdsReturn.mjs";

it("holdsReturn demonstrates functions returning objects held strongly or weakly", async () => {
  function voidObject(): object {
    return {};
  }

  const setOfObjects = new Set<object>;
  function objectInSet(): object {
    const obj = {};
    setOfObjects.add(obj);
    return obj;
  }

  await expectAsync(holdsReturn(10, 10, voidObject)).toBeResolvedTo(false);
  await expectAsync(holdsReturn(10, 10, objectInSet)).toBeResolvedTo(true);
});
