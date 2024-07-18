import {
  DefaultMap
} from "#stage_utilities/source/collections/DefaultMap.js";
import RevokerManagement from "#objectgraph_handlers/source/RevokerManagement.js";
import holdsArgument from "#stage_utilities/source/gc/holdsArgument.mjs";

describe("RevokerManagement class", () => {
  let manager: RevokerManagement;
  const countMap = new DefaultMap<string, number>;

  beforeEach(() => {
    manager = new RevokerManagement("red")
    countMap.clear();
  });

  function buildPair(graphName: string): [{ name: string }, jasmine.Spy<() => void>] {
    const name = graphName + countMap.getDefault(graphName, () => 1);
    const rv:  [{ name: string }, jasmine.Spy<() => void>] = [ { name }, jasmine.createSpy(name)];
    manager.addRevoker(...rv, graphName);
    return rv;
  }

  it("does not execute revokers until we revoke an object graph", () => {
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

  describe("holds references", () => {
    it("to proxies weakly when no one holds the revoker", async () => {
      await expectAsync(holdsArgument(
        5, 5, proxy => { manager.addRevoker(proxy, (): void => {}, "blue")})
      ).toBeResolvedTo(false);
    });

    it("to references weakly when no one holds the proxy", async () => {
      const revokerToKeyMap = new WeakMap<() => void, object>
      await expectAsync(holdsArgument(
        5, 5, revokerKey => {
          const revoker = (): void => {};
          revokerToKeyMap.set(revoker, revokerKey);
          manager.addRevoker({}, revoker, "green");
        }
      )).toBeResolvedTo(false);
    });

    it("to proxies strongly when something holds the revoker", async () => {
      const revokers: (() => void)[] = [];
      await expectAsync(holdsArgument(
        5, 5, proxy => {
          const revoker = (): void => {};
          revokers.push(revoker);
          manager.addRevoker(proxy, revoker, "blue")
        })
      ).toBeResolvedTo(true);
    });

    it("to references strongly when something holds the proxy", async () => {
      const revokerToKeyMap = new WeakMap<() => void, object>
      const proxies: object[] = [];

      await expectAsync(holdsArgument(
        5, 5, revokerKey => {
          const revoker = (): void => {};
          revokerToKeyMap.set(revoker, revokerKey);

          const proxy = {};
          proxies.push(proxy);
          manager.addRevoker(proxy, revoker, "green");
        }
      )).toBeResolvedTo(true);
    });
  });
});
