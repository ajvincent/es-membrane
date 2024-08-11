import RevokerManagement from "#objectgraph_handlers/source/RevokerManagement.js";
import holdsArgument from "#stage_utilities/source/gc/holdsArgument.mjs";

describe("RevokerManagement class holds references", () => {
  let manager: RevokerManagement;

  beforeEach(() => {
    manager = new RevokerManagement("red")
  });

  it("to proxies weakly when no one holds the revoker", async () => {
      await expectAsync(holdsArgument(
        5, 5, proxy => { manager.addRevoker(proxy, (): void => {}, "blue")})
      ).toBeResolvedTo(false);
    });

  it("to revokers weakly when no one holds the proxy", async () => {
    const revokerToKeyMap = new WeakMap<() => void, object>
    await expectAsync(holdsArgument(
      5, 10, revokerKey => {
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

  it("to revokers strongly when something holds the proxy", async () => {
    const revokerToKeyMap = new WeakMap<() => void, object>
    const proxies: object[] = [];

    await expectAsync(holdsArgument(
      5, 10, revokerKey => {
        const revoker = (): void => {};
        revokerToKeyMap.set(revoker, revokerKey);

        const proxy = {};
        proxies.push(proxy);
        manager.addRevoker(proxy, revoker, "green");
      }
    )).toBeResolvedTo(true);
  });
});
