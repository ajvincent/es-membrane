import type {
  ReadonlyDeep
} from "type-fest";

import {
  GuestEngine,
} from "./engine262-tools/GuestEngine.js";

import type {
  ReferenceGraph,
} from "./ReferenceGraph.js";

import type {
  GuestRealmOutputs
} from "./engine262-tools/types/Virtualization262.js";

import {
  directInvoke
} from "./engine262-tools/directInvoke.js";

import {
  defineSearchReferences
} from "./engine262-tools/built-ins/defineSearchReferences.js";

export async function runSearchesInGuestEngine(
  absolutePathToFile: string,
): Promise<ReadonlyDeep<Map<string, ReferenceGraph>>>
{
  const graphs = new Map<string, ReferenceGraph>;

  const outputs: GuestRealmOutputs = await directInvoke({
    absolutePathToFile,
    defineBuiltIns: (realm: GuestEngine.ManagedRealm): void => {
      defineSearchReferences(realm, graphs);
    }
  });

  if (outputs.succeeded === false) {
    throw new Error("evaluating module in guest engine failed: " + absolutePathToFile);
  }

  return graphs;
}
