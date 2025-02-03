import type {
  ReadonlyDeep,
} from "type-fest";

import type {
  ReferenceGraph,
} from "../../source/ReferenceGraph.js";

export declare function searchReferences(
  this: void,
  targetValue: object,
  heldValues: readonly object[],
  strongReferencesOnly: boolean,
): ReadonlyDeep<ReferenceGraph>;
