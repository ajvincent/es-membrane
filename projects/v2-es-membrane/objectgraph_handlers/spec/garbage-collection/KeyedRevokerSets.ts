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

describe("KeyedRevokerSets class holds references", () => {
  let graphs: ReadonlyMap<string, SearchGraph | null>;
  beforeAll(async () => {
    graphs = await runSearchesInGuestEngine(
      pathToModule(stageDir, "references/KeyedRevokerSets.js")
    );
  });

  it("to a proxy weakly", () => {
    expect(graphs.get("weak hold on proxy")!).not.toBeNull();
    expect(graphs.get("strong hold on proxy")!).toBeNull();
  });

  it("to the revoker weakly", () => {
    expect(graphs.get("weak hold on revoker")!).not.toBeNull();
    expect(graphs.get("strong hold on revoker")!).toBeNull();
  });

  it("to the revoker jointly with the proxy", () => {
    expect(graphs.get("joint hold on revoker with proxy")!).not.toBeNull();
  });
});
