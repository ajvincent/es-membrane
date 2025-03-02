import graphlib from "@dagrejs/graphlib";

import type {
  ReadonlyDeep
} from "type-fest";

import {
  runSearchesInGuestEngine
} from "../../source/runSearchesInGuestEngine.js";

import {
  getReferenceSpecPath,
} from "./projectRoot.js";

type GraphsFromSearch = ReadonlyDeep<Map<string, graphlib.Graph | null>>;
const GraphsFromFileSearches = new Map<string, Promise<GraphsFromSearch>>;

export async function getActualGraph(
  referenceSpec: string,
  graphName: string
): Promise<object | null>
{
  const pathToSearch = getReferenceSpecPath(referenceSpec);

  let promiseGraphs: Promise<GraphsFromSearch> | undefined = GraphsFromFileSearches.get(pathToSearch);
  if (!promiseGraphs) {
    promiseGraphs = runSearchesInGuestEngine(pathToSearch);
    GraphsFromFileSearches.set(pathToSearch, promiseGraphs);
  }

  const graphs: GraphsFromSearch = await promiseGraphs;

  const heldValuesGraph = graphs.get(graphName);
  if (heldValuesGraph === undefined)
    throw new Error("no graph found");

  if (heldValuesGraph === null)
    return heldValuesGraph;
  return graphlib.json.write(heldValuesGraph);
}
