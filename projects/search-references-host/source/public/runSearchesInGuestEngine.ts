import type {
  Graph,
} from "@dagrejs/graphlib";

import {
  defineSearchReferences
} from "../engine262-tools/built-ins/defineSearchReferences.js";

import {
  GuestEngine,
} from "../engine262-tools/host-to-guest/GuestEngine.js";

import {
  directInvoke
} from "../engine262-tools/host-to-guest/directInvoke.js";

import type {
  GuestRealmOutputs
} from "../engine262-tools/types/Virtualization262.js";

import type {
  SearchConfiguration
} from "./types/SearchConfiguration.js";

export async function runSearchesInGuestEngine(
  absolutePathToFile: string,
  searchConfiguration?: SearchConfiguration,
): Promise<ReadonlyMap<string, Graph | null>>
{
  const graphs = new Map<string, Graph | null>;

  const outputs: GuestRealmOutputs = await directInvoke({
    absolutePathToFile,
    defineBuiltIns: function * (realm: GuestEngine.ManagedRealm): GuestEngine.Evaluator<void> {
      yield * defineSearchReferences(realm, graphs, searchConfiguration);
    }
  });

  if (outputs.succeeded === false) {
    throw new Error("evaluating module in guest engine failed: " + absolutePathToFile);
  }

  return graphs;
}
