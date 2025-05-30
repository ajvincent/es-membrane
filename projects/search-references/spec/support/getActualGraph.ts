import graphlib from "@dagrejs/graphlib";

import type {
  ReadonlyDeep
} from "type-fest";

import type {
  GraphNodeWithMetadata
} from "../../source/graph-analysis/types/ObjectGraphIfc.js";

import {
  runSearchesInGuestEngine
} from "../../source/public/host/runSearchesInGuestEngine.js";

import type {
  SearchConfiguration
} from "../../source/public/core-host/types/SearchConfiguration.js";

import type {
  GraphObjectMetadata
} from "../../source/types/GraphObjectMetadata.js";

import {
  getReferenceSpecPath,
  referenceSpecDir,
} from "./projectRoot.js";

type GraphsFromSearch = ReadonlyDeep<Map<string, graphlib.Graph | null>>;
const GraphsFromFileSearches = new Map<string, Promise<GraphsFromSearch>>;

const TracingFromFileSearches = new Map<string, string[]>;

export async function getActualGraph(
  referenceSpec: string,
  graphName: string,
  noFunctionEnvironment: boolean
): Promise<object | null>
{
  const pathToSearch = getReferenceSpecPath(referenceSpec);

  let promiseGraphs: Promise<GraphsFromSearch> | undefined = GraphsFromFileSearches.get(pathToSearch);
  if (!promiseGraphs) {
    const config: SearchConfiguration = new TracingConfiguration(referenceSpec, noFunctionEnvironment);
    const rawGraphsPromise: Promise<ReadonlyMap<string, graphlib.Graph | null>> = runSearchesInGuestEngine(pathToSearch, config);
    promiseGraphs = rawGraphsPromise.then(graphMap => {
      for (const graph of graphMap.values()) {
        if (graph)
          canonicalizeSpecifiers(graph);
      }
      return graphMap;
    });
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

function canonicalizeSpecifiers(
  graph: graphlib.Graph
): void
{
  for (const nodeId of graph.nodes()) {
    const node = graph.node(nodeId);
    if (!node)
      continue;
    const { metadata } = node as GraphNodeWithMetadata<GraphObjectMetadata>;

    if (metadata?.classSpecifier) {
      metadata.classSpecifier = metadata.classSpecifier.replace(
        "file://" + referenceSpecDir, "virtual://home/reference-spec"
      );
    }
  }
}

export function getTracingLog(
  sourceSpecifier: string,
  resultsKey: string
): readonly string[] | undefined
{
  const hash: string = TracingConfiguration.hashSpecifierAndKey(sourceSpecifier, resultsKey);
  return TracingFromFileSearches.get(hash);
}

class TracingConfiguration implements Required<SearchConfiguration> {
  static hashSpecifierAndKey(
    referenceSpec: string,
    resultsKey: string
  ): string
  {
    return referenceSpec + ": " + resultsKey;
  }

  #tracingHash: string = "";

  readonly #referenceSpec: string;
  readonly noFunctionEnvironment: boolean;

  constructor(referenceSpec: string, noFunctionEnvironment: boolean) {
    this.#referenceSpec = referenceSpec;
    this.noFunctionEnvironment = noFunctionEnvironment;
  }

  internalErrorTrap(): void {
    // eslint-disable-next-line no-debugger
    debugger;
  }

  beginSearch(sourceSpecifier: string, resultsKey: string): void {
    void(sourceSpecifier);
    this.#tracingHash = TracingConfiguration.hashSpecifierAndKey(this.#referenceSpec, resultsKey);
    this.log("enter " + this.#tracingHash, 0);
  }

  endSearch(sourceSpecifier: string, resultsKey: string): void {
    void(sourceSpecifier);
    void(resultsKey);
    this.log("leave " + this.#tracingHash, 0);
    this.#tracingHash = "";
  }

  enterNodeIdTrap(nodeId: string): void {
    this.log("enter search nodeId: " + nodeId, 1);
  }

  leaveNodeIdTrap(nodeId: string): void {
    this.log("leave search nodeId: " + nodeId, 1);
  }

  defineNodeTrap(parentId: string, weakKey: string, details: string): void {
    this.log(`defineNode: parentId=${parentId} weakKeyId=${weakKey} ${details}`);
  }

  defineEdgeTrap(
    parentId: string,
    edgeId: string,
    childId: string,
    secondParentId: string | undefined,
    isStrongReference: boolean
  ): void
  {
    const secondIdPart = secondParentId ? " + " + secondParentId : "";
    this.log(
      `defineEdgeTrap: ${parentId}${secondIdPart} via ${edgeId} to ${childId}, isStrongReference: ${isStrongReference}`
    );
  }

  defineWeakKeyTrap(weakKey: string): void {
    this.log("weak key defined: " + weakKey);
  };

  markStrongNodeTrap(nodeId: string): void {
    this.log("mark strong node: " + nodeId);
  };

  log(message: string, indentLevel = 2): void {
    message = "  ".repeat(indentLevel) + message;

    if (TracingFromFileSearches.has(this.#tracingHash) === false) {
      TracingFromFileSearches.set(this.#tracingHash, []);
    }
    TracingFromFileSearches.get(this.#tracingHash)!.push(message)
  }
}
