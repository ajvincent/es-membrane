import {
  defineSearchReferences
} from "../../engine262-tools/built-ins/defineSearchReferences.js";

import {
  definePrintFunction
} from "../../engine262-tools/built-ins/definePrintFunction.js";

import type {
  GuestEngine,
} from "../../engine262-tools/host-to-guest/GuestEngine.js";

import {
  runInRealm
} from "../../engine262-tools/host-to-guest/runInRealm.js";

import type {
  GuestRealmInputs,
  GuestRealmInputsWithBuiltins,
  GuestRealmOutputs
} from "../../engine262-tools/types/Virtualization262.js";

import type {
  SearchGraph
} from "../../graph-analysis/types/SearchGraph.js";

import type {
  SearchConfiguration
} from "./types/SearchConfiguration.js";

export {
  LoggingConfiguration
} from "./LoggingConfiguration.js";

export {
  pathsToTarget
} from "./pathsToTarget.js";

export type {
  GuestRealmInputs,
  SearchConfiguration,
  SearchGraph,
};

export async function runSearchesInGuestEngine(
  inputs: GuestRealmInputs,
  searchConfiguration: SearchConfiguration,
): Promise<ReadonlyMap<string, SearchGraph | null>>
{
  const graphs = new Map<string, SearchGraph | null>;
  try {
    const realmInputs: GuestRealmInputsWithBuiltins = new SearchGuestRealmInputs(
      inputs, graphs, searchConfiguration
    );

    const outputs: GuestRealmOutputs = await runInRealm(realmInputs);
    if (!outputs?.succeeded) {
      throw new Error("evaluating module in guest engine failed: " + inputs.startingSpecifier);
    }
  }
  catch (ex) {
    if (searchConfiguration.printToScriptLog)
      searchConfiguration.printToScriptLog(String(ex));
    else
      throw ex;
  }

  return graphs;
}

class SearchGuestRealmInputs implements GuestRealmInputsWithBuiltins {
  readonly #baseInputs: GuestRealmInputs;
  readonly #graphs: Map<string, SearchGraph | null>;
  readonly #searchConfiguration: SearchConfiguration;

  constructor(
    baseInputs: GuestRealmInputs,
    graphs: Map<string, SearchGraph | null>,
    searchConfiguration: SearchConfiguration,
  )
  {
    this.#baseInputs = baseInputs;
    this.#graphs = graphs;
    this.#searchConfiguration = searchConfiguration;
  }

  get startingSpecifier(): string {
    return this.#baseInputs.startingSpecifier;
  }

  contentsGetter(specifier: string): string {
    try {
      const contents: string = this.#baseInputs.contentsGetter(specifier);
      this.printToScriptLog(`retrieved contents from "${specifier}"`);
      return contents;
    }
    catch (ex) {
      this.printToScriptLog(`error retrieving contents from "${specifier}"`);
      throw ex;
    }
  }

  resolveSpecifier(targetSpecifier: string, sourceSpecifier: string): string {
    try {
      const resultSpecifier = this.#baseInputs.resolveSpecifier(targetSpecifier, sourceSpecifier);
      this.printToScriptLog(`resolved with target "${targetSpecifier}" and source "${sourceSpecifier}", result: "${resultSpecifier}"` );
      return resultSpecifier;
    }
    catch (ex) {
      this.printToScriptLog(`resolveSpecifier failed with target "${targetSpecifier}" and source "${sourceSpecifier}"`);
      throw ex;
    }
  }

  printToScriptLog(...values: readonly string[]): void {
    if (this.#searchConfiguration.printToScriptLog)
      this.#searchConfiguration.printToScriptLog(...values);
  }

  * defineBuiltIns(realm: GuestEngine.ManagedRealm): GuestEngine.Evaluator<void> {
    yield * defineSearchReferences(realm, this.#graphs, this.#searchConfiguration);
    yield * definePrintFunction(realm, this.#searchConfiguration);
  }
}
