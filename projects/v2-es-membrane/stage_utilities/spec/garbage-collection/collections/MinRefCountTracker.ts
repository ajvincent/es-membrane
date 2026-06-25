import path from "node:path";
import {
  LoggingConfiguration,
  type SearchGraph,
  runSearchesInGuestEngine,
} from "es-search-references/host";

import {
  stageDir
} from "#stage_utilities/spec/support/stageDir.js";

it("MinRefCountTracker never holds any references", async () => {
  const config = new LoggingConfiguration();
  const graphs: ReadonlyMap<string, SearchGraph | null> = await runSearchesInGuestEngine(
    path.join(stageDir, "references/collections/MinRefCountTracker.js"),
    config
  );

  const specs: readonly string[] = [
    "shared before deleting references",
    "redValue before deleting references",
    "shared after deleting greenValue",
    "redValue after deleting greenValue",
    "shared after deleting blueValue",
    "redValue after deleting blueValue",
  ];

  for (const spec of specs) {
    expect(graphs.get(spec)).withContext(spec).toBeNull();
  }

  expect(graphs.size).withContext("full coverage").toBe(specs.length);
});
