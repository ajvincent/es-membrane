/*
import type {
  ReadonlyDeep
} from "type-fest";

import {
  GuestEngine,
} from "./engine262-tools/GuestEngine.js";

import {
  defineSearchReferences
} from "./engine262-tools/built-ins/defineSearchReferences.js";

import {
  directInvoke
} from "./engine262-tools/directInvoke.js";

import type {
  GuestRealmOutputs
} from "./engine262-tools/types/Virtualization262.js";

import type {
  ReferenceGraph,
} from "./types/ReferenceGraph.js";
*/

export async function runSearchesInGuestEngine(
  absolutePathToFile: string,
): Promise<never>//Promise<ReadonlyDeep<Map<string, ReferenceGraph>>>
{
  /*
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
  */
  void(absolutePathToFile);
  return Promise.reject(new Error("rewriting"));
}
