import type {
  SearchGraph
} from "./SearchGraph.js";

export interface CloneableGraphIfc {
  cloneGraph(): SearchGraph;
}
