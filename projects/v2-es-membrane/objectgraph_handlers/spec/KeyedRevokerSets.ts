import { KeyedRevokerSets } from "#objectgraph_handlers/source/KeyedRevokerSets.js";

it("KeyedRevokerSets do not execute revokers until we revoke an object graph", () => {
  const revokerSets = new KeyedRevokerSets;
  const countMap = new Map<string, number>;

  function buildPair(graphName: string): [{ name: string }, jasmine.Spy<() => void>] {
    const name = graphName + countMap.getOrInsertComputed(graphName, () => 1);
    const rv: [{ name: string }, jasmine.Spy<() => void>] = [ { name }, jasmine.createSpy(name)];
    revokerSets.addRevoker(...rv, [graphName, "red"]);
    return rv;
  }

  const blue1 = buildPair("blue"), blue2 = buildPair("blue"),
      green1 = buildPair("green"), green2 = buildPair("green"),
      yellow1 = buildPair("yellow"), yellow2 = buildPair("yellow");

  const allPairs = [blue1, blue2, green1, green2, yellow1, yellow2];
  const greenPairs = [green1, green2];
  const otherPairs = [blue1, blue2, yellow1, yellow2];

  for (const [obj, revoker] of allPairs)
    expect(revoker).withContext(obj.name).toHaveBeenCalledTimes(0);

  revokerSets.revokeSet("green");
  for (const [obj, revoker] of greenPairs)
    expect(revoker).withContext(obj.name + " before revokeAll").toHaveBeenCalledOnceWith();
  for (const [obj, revoker] of otherPairs)
    expect(revoker).withContext(obj.name + " before revokeAll").toHaveBeenCalledTimes(0);

  expect(() => revokerSets.revokeSet("green")).not.toThrow();

  expect(() => buildPair("green")).toThrowError("At least one key has been revoked");
  expect(
    () => revokerSets.addRevoker(...green2, ["orange"])
  ).toThrowError("We have already called this revoker.");

  revokerSets.revokeAll();
  for (const [obj, revoker] of allPairs)
    expect(revoker).withContext(obj.name + " after revokeAll").toHaveBeenCalledOnceWith();

  expect(() => buildPair("yellow")).toThrowError("All keys have been revoked");
  expect(
    () => revokerSets.addRevoker({}, () => undefined, ["purple"])
  ).toThrowError("All keys have been revoked");
  expect(() => revokerSets.revokeSet("green")).not.toThrow();
});
