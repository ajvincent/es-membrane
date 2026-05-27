import path from "node:path";
import {
  runSearchesInGuestEngine,
  SearchGraph
} from "es-search-references/host";

import { stageDir } from "#stage_utilities/spec/support/stageDir.js";

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
});
