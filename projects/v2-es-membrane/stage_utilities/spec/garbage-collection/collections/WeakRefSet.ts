import path from "node:path";
import {
  LoggingConfiguration,
  type SearchGraph,
  runSearchesInGuestEngine,
  pathsToTarget,
} from "es-search-references/host";

import {
  stageDir
} from "#stage_utilities/spec/support/stageDir.js";

it("WeakRefSet holds references to objects weakly", async () => {
  const logConfig = new LoggingConfiguration();
  const absolutePathToFile = path.join(stageDir, "references/collections/WeakRefSet.js");

  const graphs: ReadonlyMap<string, SearchGraph | null> = await runSearchesInGuestEngine(
    absolutePathToFile,
    logConfig,
  );

  const weakSpecKey = "refset with first value just inserted (weak)";
  const weakPaths = pathsToTarget(graphs.get(weakSpecKey)!);
  expect(weakPaths.length).withContext(JSON.stringify(weakPaths, null, 2)).toBeGreaterThan(0);

  expect(graphs.get("refset with first value just inserted (strong)")).toBeNull();
  expect(graphs.size).toBe(2);
});
