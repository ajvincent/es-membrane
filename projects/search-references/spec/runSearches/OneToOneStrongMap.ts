import {
  getActualGraph,
} from "../support/getActualGraph.js";

describe("Integration test: OneToOneStrongMap,", () => {
  it("proxied redArray via blueOwner is reachable", async () => {
    const actual = await getActualGraph("OneToOneStrongMap.js", "proxied redArray via blueOwner", false);
    expect(actual).not.toBeNull();
  });

  it("revoked redArray via blueOwner", async () => {
    const actual = await getActualGraph("OneToOneStrongMap.js", "revoked redArray via blueOwner", false);
    expect(actual).toBeNull();
  });

  it("redArrayProxy via blueOwner", async () => {
    const actual = await getActualGraph("OneToOneStrongMap.js", "redArrayProxy via blueOwner", false);
    expect(actual).not.toBeNull();
  });

  it("redOwnerProxy via blueOwner", async () => {
    const actual = await getActualGraph("OneToOneStrongMap.js", "redOwnerProxy via blueOwner", false);
    expect(actual).not.toBeNull();
  });
});
