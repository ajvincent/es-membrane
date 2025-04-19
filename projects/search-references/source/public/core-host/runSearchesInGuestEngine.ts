import type {
  Graph,
} from "@dagrejs/graphlib";

import {
  defineSearchReferences
} from "../../engine262-tools/built-ins/defineSearchReferences.js";

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
  SearchConfiguration
} from "./types/SearchConfiguration.js";

export { LoggingConfiguration } from "./LoggingConfiguration.js";
export type { SearchConfiguration };

export async function runSearchesInGuestEngine(
  inputs: GuestRealmInputs,
  searchConfiguration?: SearchConfiguration,
): Promise<ReadonlyMap<string, Graph | null>>
{
  const graphs = new Map<string, Graph | null>;
  const realmInputs: GuestRealmInputsWithBuiltins =  new SearchGuestRealmInputs(inputs, graphs, searchConfiguration);
  const outputs: GuestRealmOutputs = await runInRealm(realmInputs);

  if (outputs.succeeded === false) {
    throw new Error("evaluating module in guest engine failed");
  }

  return graphs;
}

class SearchGuestRealmInputs implements GuestRealmInputsWithBuiltins {
  readonly #baseInputs: GuestRealmInputs;
  readonly #graphs: Map<string, Graph | null>;
  readonly #searchConfiguration?: SearchConfiguration;

  constructor(
    baseInputs: GuestRealmInputs,
    graphs: Map<string, Graph | null>,
    searchConfiguration?: SearchConfiguration,
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
    return this.#baseInputs.contentsGetter(specifier);
  }
  resolveSpecifier(targetSpecifier: string, sourceSpecifier: string): string {
    return this.#baseInputs.resolveSpecifier(targetSpecifier, sourceSpecifier);
  }

  * defineBuiltIns(realm: GuestEngine.ManagedRealm): GuestEngine.Evaluator<void> {
    yield * defineSearchReferences(realm, this.#graphs, this.#searchConfiguration);
  }
}