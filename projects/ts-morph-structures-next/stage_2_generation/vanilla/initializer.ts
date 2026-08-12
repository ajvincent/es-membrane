import {
  requireUnion
} from "./UnionMap.js";

let hasCompleted = false;

export default function initializeTypes(): void
{
  if (!hasCompleted) {
    requireUnion("Structures");
    hasCompleted = true;
  }
}
