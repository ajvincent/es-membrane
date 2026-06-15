import path from "node:path";
import {
  pathToFileURL
} from "node:url";

import {
  getActualGraph,
  getScriptLog,
} from "../../support/getActualGraph.js";

import {
  getReferenceSpecPath,
  guestSearchReferencesURL,
} from "../../support/projectRoot.js";

it("errors/importNonExistentModule.js", async () => {
  await expectAsync(
    getActualGraph("errors/importNonExistentModule.js", "pass", false)
  ).toBeRejected();

  const pathToSpecFile = getReferenceSpecPath("errors/importNonExistentModule.js");
  const hrefToSpecFile = pathToFileURL(pathToSpecFile).href;

  const relativePathToMapModule = "../fixtures/OneToOneStrongMap/OneToOneStrongMap.js";
  // the failure is the spec didn't correct for the relative path
  const pathToMapModule = path.normalize(path.resolve(pathToSpecFile, "..", relativePathToMapModule));
  const hrefToMapModule = pathToFileURL(pathToMapModule).href;

  expect(getScriptLog("errors/importNonExistentModule.js")).toEqual([
    `retrieved contents from "${hrefToSpecFile}"`,
    `resolved with target "es-search-references/guest" and source "${
      hrefToSpecFile
    }", result: "${guestSearchReferencesURL}"`,
    `retrieved contents from "${guestSearchReferencesURL}"`,
    `resolved with target "${relativePathToMapModule}" and source "${
      hrefToSpecFile
    }", result: "${hrefToMapModule}"`,
    `error retrieving contents from "${hrefToMapModule}"`,
    `Error: ENOENT: no such file or directory, open '${pathToMapModule}'`,
  ]);
});
