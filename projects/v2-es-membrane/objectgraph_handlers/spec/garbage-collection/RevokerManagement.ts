import {
  type SearchGraph,
  runSearchesInGuestEngine,
} from "es-search-references/host";

import {
  pathToModule,
} from "#stage_utilities/source/AsyncSpecModules.js";

import {
  stageDir
} from "#objectgraph_handlers/pre-build/constants.js";

xdescribe("RevokerManagement class holds references", () => {
  let graphs: ReadonlyMap<string, SearchGraph | null>;
  beforeAll(async () => {
    graphs = await runSearchesInGuestEngine(
      pathToModule(stageDir, "references/RevokerManagement.js")
    );
  });

  it("to the primary key strongly", () => {
    expect(graphs.get("Revoker management holds primary key strongly")!).not.toBeNull();
  });

  it("to a revoker function weakly", () => {
    expect(graphs.get("Revoker management holds proxy weakly")!).withContext("blueOne.proxy weak").not.toBeNull();
    expect(graphs.get("Revoker management holds proxy strongly")!).withContext("blueOne.proxy strong").toBeNull();
  });
});
