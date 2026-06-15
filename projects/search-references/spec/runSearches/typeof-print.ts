import {
  pathToFileURL
} from "node:url";

import {
  getActualGraph,
  getScriptLog,
} from "../support/getActualGraph.js";

import {
  getReferenceSpecPath,
  guestSearchReferencesURL,
} from "../support/projectRoot.js";

it("typeof print === 'function'", async () => {
  const actual = await getActualGraph("typeof-print.js", "pass", false);
  expect(actual).not.toBeNull();

  const pathToPrintFile = pathToFileURL(getReferenceSpecPath("typeof-print.js")).href;

  expect(getScriptLog("typeof-print.js")).toEqual([
    `retrieved contents from "${pathToPrintFile}"`,
    `resolved with target "es-search-references/guest" and source "${
      pathToPrintFile
    }", result: "${guestSearchReferencesURL}"`,
    `retrieved contents from "${guestSearchReferencesURL}"`,
    `'before the search'`,
    `searchReferences enter: pass`,
    `searchReferences leave: pass`,
    "'after the search'",
  ]);
});
