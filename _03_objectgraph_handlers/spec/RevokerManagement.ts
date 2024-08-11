import {
  DefaultMap
} from "#stage_utilities/source/collections/DefaultMap.js";
import RevokerManagement from "#objectgraph_handlers/source/RevokerManagement.js";
import holdsArgument from "#stage_utilities/source/gc/holdsArgument.mjs";

it("RevokerManagement class does not execute revokers until we revoke an object graph", () => {
  const manager: RevokerManagement = new RevokerManagement("red");
  const countMap = new DefaultMap<string, number>;

  function buildPair(graphName: string): [{ name: string }, jasmine.Spy<() => void>] {
    const name = graphName + countMap.getDefault(graphName, () => 1);
    const rv:  [{ name: string }, jasmine.Spy<() => void>] = [ { name }, jasmine.createSpy(name)];
    manager.addRevoker(...rv, graphName);
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

  manager.revokeSet("green");
  for (const [obj, revoker] of greenPairs)
    expect(revoker).withContext(obj.name).toHaveBeenCalledOnceWith();
  for (const [obj, revoker] of otherPairs)
    expect(revoker).withContext(obj.name).toHaveBeenCalledTimes(0);

  manager.revokeSet("red");
  for (const [obj, revoker] of allPairs)
    expect(revoker).withContext(obj.name).toHaveBeenCalledOnceWith();

  // not going to test adding revokers on a graph that's been revoked - it'll never happen
});
