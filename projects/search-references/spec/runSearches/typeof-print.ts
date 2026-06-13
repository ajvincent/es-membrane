import {
  getActualGraph,
  getScriptLog,
} from "../support/getActualGraph.js";

it("typeof print === 'function'", async () => {
  const actual = await getActualGraph("typeof-print.js", "pass", false);
  expect(actual).not.toBeNull();

  expect(getScriptLog("typeof-print.js")).toEqual([
    "'before the search'",
    `searchReferences enter: pass`,
    `searchReferences leave: pass`,
    "'after the search'",
  ]);
});
