import type {
  ReadonlyDeep
} from "type-fest";

import {
  GuestEngine
} from "./engine262-tools/GuestEngine.js";

import type {
  ReferenceGraph
} from "./ReferenceGraph.js";

import type {
  GuestRealmOutputs
} from "./engine262-tools/types/Virtualization262.js";

import {
  directInvoke
} from "./engine262-tools/directInvoke.js";

import {
  defineSearchReferences
} from "./engine262-tools/defineSearchReferences.js";

export interface SearchResults {
  readonly graphs: ReadonlyDeep<Map<string, ReferenceGraph>>;
  readonly reportCalls: ReadonlyMap<string, boolean>;
}

export async function runSearchesInGuestEngine(
  absolutePathToFile: string
): Promise<ReadonlyDeep<SearchResults>>
{
  const graphs = new Map<string, ReferenceGraph>;
  const reportCalls = new Map<string, boolean>;

  const outputs: GuestRealmOutputs = await directInvoke({
    absolutePathToFile,
    defineBuiltIns: (realm: GuestEngine.ManagedRealm): void => {
      defineSearchReferences(realm, graphs);
    }
  });

  if (outputs.succeeded === false) {
    throw new Error("evaluating module in guest engine failed: " + absolutePathToFile);
  }

  return {
    graphs,
    reportCalls
  };
}
