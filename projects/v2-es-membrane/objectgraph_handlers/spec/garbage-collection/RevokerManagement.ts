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

describe("RevokerManagement class holds references", () => {
  let graphs: ReadonlyMap<string, SearchGraph | null>;
  beforeAll(async () => {
    graphs = await runSearchesInGuestEngine(
      pathToModule(stageDir, "references/RevokerManagement.js")
    );
  });

  it("to the primary key strongly", () => {
    expect(graphs.get("Revoker management holds primary key strongly")!).not.toBeNull();
  });

  xit(": todo", () => {
    expect(false).toBeTrue();
  });
});
