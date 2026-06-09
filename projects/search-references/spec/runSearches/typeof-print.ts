import {
  getActualGraph,
} from "../support/getActualGraph.js";

it("typeof print === 'function'", async () => {
  const actual = await getActualGraph("typeof-print.js", "pass", false);
  expect(actual).not.toBeNull();
});
