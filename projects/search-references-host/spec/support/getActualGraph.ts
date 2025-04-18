import graphlib from "@dagrejs/graphlib";

import type {
  ReadonlyDeep
} from "type-fest";

import {
  runSearchesInGuestEngine
} from "../../source/public/host/runSearchesInGuestEngine.js";

import {
  SearchConfiguration
} from "../../source/public/host/types/SearchConfiguration.js";

import {
  getReferenceSpecPath,
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
    promiseGraphs = runSearchesInGuestEngine(pathToSearch, config);
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

export function getTracingLog(
  sourceSpecifier: string,
  resultsKey: string
): readonly string[] | undefined
{
  const hash: string = TracingConfiguration.hashSpecifierAndKey(sourceSpecifier, resultsKey);
  return TracingFromFileSearches.get(hash);
}

class TracingConfiguration implements SearchConfiguration {
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
    this.log("enter " + this.#tracingHash, true);
  }

  endSearch(sourceSpecifier: string, resultsKey: string): void {
    void(sourceSpecifier);
    void(resultsKey);
    this.log("leave " + this.#tracingHash, true);
    this.#tracingHash = "";
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

  log(message: string, noIndent?: boolean): void {
    if (!noIndent)
      message = "  " + message;

    if (TracingFromFileSearches.has(this.#tracingHash) === false) {
      TracingFromFileSearches.set(this.#tracingHash, []);
    }
    TracingFromFileSearches.get(this.#tracingHash)!.push(message)
  }
}
