import {
  getActualGraph,
} from "../../support/getActualGraph.js";

it("Iterator searches, for user-defined iterators, don't necessarily return anything", async () => {
  const actual = await getActualGraph("iterators/user-defined.js", "no explicit hold", false);
  expect(actual).toBeNull();
});
