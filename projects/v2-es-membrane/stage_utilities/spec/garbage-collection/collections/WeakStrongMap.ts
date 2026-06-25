import path from "node:path";
import {
  LoggingConfiguration,
  type SearchGraph,
  runSearchesInGuestEngine,
} from "es-search-references/host";

import { stageDir } from "#stage_utilities/spec/support/stageDir.js";

describe("WeakStrongMap holds references to the", () => {
  let graphs: ReadonlyMap<string, SearchGraph | null>;
  const config = new LoggingConfiguration();
  beforeAll(async () => {
    graphs = await runSearchesInGuestEngine(
      path.join(stageDir, "references/collections/WeakStrongMap.js"),
      config
    );
  });

  it("first key weakly", () => {
    expect(graphs.get("set holds the first key weakly")).not.toBeNull();
    expect(graphs.get("set holds the first key strongly")).toBeNull();
  });

  it("second key weakly", () => {
    expect(graphs.get("set holds the second key weakly")).not.toBeNull();
    expect(graphs.get("set holds the second key strongly")).not.toBeNull();
    expect(graphs.get("set holds the second key jointly with the first key")).not.toBeNull();
  });

  it("value weakly", () => {
    expect(graphs.get("set holds the value weakly")!).not.toBeNull();
    expect(graphs.get("set holds the value strongly")!).toBeNull();
    expect(graphs.get("set holds the value jointly with the first key")!).not.toBeNull();

    expect(graphs.size).withContext("full coverage").toBe(8);
  });
});
