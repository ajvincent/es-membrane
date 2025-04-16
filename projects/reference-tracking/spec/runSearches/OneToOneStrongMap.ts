import {
  getActualGraph,
  getTracingLog,
} from "../support/getActualGraph.js";

xdescribe("Integration test: OneToOneStrongMap,", () => {
  it("proxied redArray via blueOwner is reachable", async () => {
    const actual = await getActualGraph("OneToOneStrongMap.js", "proxied redArray via blueOwner", false);
    const log = getTracingLog("OneToOneStrongMap.js", "proxied redArray via blueOwner");
    void(log);
    expect(actual).not.toBeNull();
  });

  it("revoked redArray via blueOwner", async () => {
    const actual = await getActualGraph("OneToOneStrongMap.js", "proxied redArray via blueOwner", false);
    const log = getTracingLog("OneToOneStrongMap.js", "revoked redArray via blueOwner");
    void(log);
    expect(actual).toBeNull();
  });

  it("redArrayProxy via blueOwner", async () => {
    const actual = await getActualGraph("OneToOneStrongMap.js", "proxied redArray via blueOwner", false);
    const log = getTracingLog("OneToOneStrongMap.js", "redArrayProxy via blueOwner");
    void(log);
    expect(actual).toBeNull();
  });

  it("redOwnerProxy via blueOwner", async () => {
    const actual = await getActualGraph("OneToOneStrongMap.js", "proxied redArray via blueOwner", false);
    const log = getTracingLog("OneToOneStrongMap.js", "redOwnerProxy via blueOwner");
    void(log);
    expect(actual).toBeNull();
  });
});
