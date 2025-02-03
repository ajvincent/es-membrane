import type {
  ReadonlyDeep,
} from "type-fest";

import type {
  ReferenceGraph,
} from "../ReferenceGraph.ts";

import type {
  SearchReferencesImpl,
} from "../types/searchReferences.js";

export function searchReferences(
  this: void,
  targetValue: object,
  heldValues: readonly object[],
  strongReferencesOnly: boolean,
): ReadonlyDeep<ReferenceGraph>
{
  void(targetValue);
  void(heldValues);
  void(strongReferencesOnly);
  throw new Error("not yet implemented");
}
searchReferences satisfies SearchReferencesImpl;
