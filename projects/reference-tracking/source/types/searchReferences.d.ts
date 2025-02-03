import type {
  ReadonlyDeep,
} from "type-fest";

import type {
  ReferenceGraph,
} from "../ReferenceGraph.ts";

export type SearchReferencesImpl = (
  targetValue: object,
  heldValues: readonly object[],
  strongReferencesOnly: boolean,
) => ReadonlyDeep<ReferenceGraph>;
