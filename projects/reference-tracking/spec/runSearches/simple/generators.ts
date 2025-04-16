//#region preamble
import {
  getActualGraph,
} from "../../support/getActualGraph.js";
//#endregion preamble

describe("Simple graph searches:", () => {
  it("generators do not directly expose their values", async () => {
    const actual = await getActualGraph("simple/generators.js", "generator holds target strongly", false);
    expect(actual).toBeNull();
  });

  it("async generators do not directly expose their values", async () => {
    const actual = await getActualGraph("simple/asyncGenerators.js", "generator holds target strongly", false);
    expect(actual).toBeNull();
  });
});
