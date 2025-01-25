import { WeakRefSet } from "../../../../source/mockups/utilities/WeakRefSet.js";
import holdsArgument from "../../../support/gc/holdsArgument.js";

describe("WeakRefSet", () => {
  let refSet: WeakRefSet<object>;
  beforeEach(() => {
    refSet = new WeakRefSet;
  });

  it("holds no strong references when we don't call addReference", async () => {
    await expectAsync(
      holdsArgument(5, 5, key => refSet.hasReference(key))
    ).withContext("hasReference").toBeResolvedTo(false);
    await expectAsync(holdsArgument(
      5, 5, key => refSet.addReference(key)
    )).withContext("getReference").toBeResolvedTo(false);
    await expectAsync(holdsArgument(
      5, 5, key => refSet.deleteReference(key)
    )).withContext("deleteReference").toBeResolvedTo(false);
  });

  describe("holds no strong references when we call addReference", () => {
    it("and nothing else", async () => {
      await expectAsync(holdsArgument(
        5, 5, key => refSet.addReference(key)
      )).toBeResolvedTo(false);
    });

    it("and then deleteReference", async () => {
      await expectAsync(holdsArgument(
        5, 5, key => {
          refSet.addReference(key);
          refSet.deleteReference(key);
        }
      )).toBeResolvedTo(false);
    });

    it("and then getReference", async () => {
      await expectAsync(holdsArgument(
        5, 5, key => {
          refSet.addReference(key);
          refSet.getReference(key);
        }
      )).toBeResolvedTo(false);
    });

    it("and then hasReference", async () => {
      await expectAsync(holdsArgument(
        5, 5, key => {
          refSet.addReference(key);
          refSet.hasReference(key);
        }
      )).toBeResolvedTo(false);
    });

    it("and then clearReference", async () => {
      await expectAsync(holdsArgument(
        5, 5, key => refSet.addReference(key), () => {
          refSet.clearReferences();
          return Promise.resolve();
        }
      )).toBeResolvedTo(false);
    });
  });
});
