import type {
  Graph,
} from "@dagrejs/graphlib";

export interface CloneableGraphIfc {
  cloneGraph(): Graph;

  /*
  // placeholder, to be clarified or removed from this interface
  defineGraphStyling(): never;
  */
}
