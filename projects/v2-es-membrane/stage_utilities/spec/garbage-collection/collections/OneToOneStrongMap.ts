import path from "node:path";
import {
  runSearchesInGuestEngine,
  SearchGraph
} from "es-search-references/host";

import {
  stageDir
} from "#stage_utilities/spec/support/stageDir.js";

describe("OneToOneStrongMap holds references to a value", () => {
  let graphs: ReadonlyMap<string, SearchGraph | null>;
  beforeAll(async () => {
    graphs = await runSearchesInGuestEngine(
      path.join(stageDir, "references/collections/OneToOneStrongMap.js")
    );
  });

  it("weakly from the map", () => {
    expect(graphs.get("1:1 binding to first value from just the map (weak)")!).not.toBeNull();
    expect(graphs.get("1:1 binding to first value from just the map (strong)")!).toBeNull();
  });

  it("jointly from the second value and the map", () => {
    expect(graphs.get("1:1 binding to first value from the map and second value (strong)")!).not.toBeNull();
  });

  it("unless the second value was deleted", () => {
    expect(graphs.get("1:1 binding after value was deleted")!).toBeNull();
  });

  it("unless revoking the second object graph", () => {
    expect(graphs.get(
      "1:1 map binding after revocation of the second graph key"
    )!).withContext("map only").toBeNull();

    expect(graphs.get(
      "1:1 joint binding after revocation of the second graph key"
    )!).withContext("with second key").toBeNull();
  });
});
