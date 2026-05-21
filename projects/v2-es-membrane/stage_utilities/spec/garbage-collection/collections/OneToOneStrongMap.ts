import path from "node:path";
import {
  runSearchesInGuestEngine,
  SearchGraph
} from "es-search-references/host";

import { stageDir } from "#stage_utilities/spec/support/stageDir.js";

xdescribe("OneToOneStrongMap holds references to a value", () => {
  let graphs: ReadonlyMap<string, SearchGraph | null>;
  beforeAll(async () => {
    graphs = await runSearchesInGuestEngine(
      path.join(stageDir, "references/collections/OneToOneStrongMap.js")
    );
  });

  it("todo", () => {
    fail("not ready yet");
  });
});
