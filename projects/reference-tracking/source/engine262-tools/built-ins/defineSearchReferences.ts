import type {
  ReadonlyDeep
} from "type-fest";

import {
  GuestEngine,
  type ThrowOr,
} from "../GuestEngine.js";

import {
  defineBuiltInFunction
} from "./defineBuiltInFunction.js";

import type {
  ReferenceGraph
} from "../../ReferenceGraph.js";

import {
  SearchDriver
} from "../search/Driver.js";

import {
  convertArrayValueToArrayOfValues
} from "../convertArrayValueToArrayOfValues.js";

interface SearchReferencesArguments {
  readonly resultsKey: string;
  readonly targetValue: GuestEngine.ObjectValue,
  readonly heldValues: readonly GuestEngine.ObjectValue[],
  readonly strongReferencesOnly: boolean,
}

export function defineSearchReferences(
  this: void,
  realm: GuestEngine.ManagedRealm,
  searchResultsMap: Map<string, ReadonlyDeep<ReferenceGraph>>,
): void
{
  defineBuiltInFunction(
    realm, "searchReferences", function performGuestSearch(
      this: void,
      guestThisArg: GuestEngine.Value,
      guestArguments: readonly GuestEngine.Value[],
      guestNewTarget: GuestEngine.Value
    ): ThrowOr<GuestEngine.BooleanValue>
    {
      void(guestThisArg);
      void(guestNewTarget);

      const searchArgs: ThrowOr<SearchReferencesArguments> = extractSearchParameters(guestArguments);
      if (searchArgs instanceof GuestEngine.ThrowCompletion)
        return searchArgs;

      if (searchResultsMap.has(searchArgs.resultsKey)) {
        return GuestEngine.Throw("Error", "Raw",
          `You already have a search with the results key ${JSON.stringify(searchArgs.resultsKey)}`
        );
      }

      const searchDriver = new SearchDriver(
        searchArgs.targetValue,
        searchArgs.heldValues,
        searchArgs.strongReferencesOnly
      );

      const graph: ThrowOr<ReadonlyDeep<ReferenceGraph>> = searchDriver.run();
      if (graph instanceof GuestEngine.ThrowCompletion)
        return graph;
      searchResultsMap.set(searchArgs.resultsKey, graph);

      return graph.succeeded ? GuestEngine.Value.true : GuestEngine.Value.false;
    }
  )
}

function extractSearchParameters(
  this: void,
  guestArguments: readonly GuestEngine.Value[],
): ThrowOr<SearchReferencesArguments>
{
  const [resultsKeyGuest, targetValue, heldValuesArrayGuest, strongRefsGuest] = guestArguments;
  if (resultsKeyGuest?.type !== "String") {
    return GuestEngine.Throw("TypeError", "Raw", "resultsKey is not a string");
  }

  if (targetValue?.type !== "Object") {
    return GuestEngine.Throw("TypeError", "NotAnObject", targetValue);
  }
  const heldValuesRaw: ThrowOr<readonly GuestEngine.Value[]> = convertArrayValueToArrayOfValues(
    heldValuesArrayGuest
  );
  if (heldValuesRaw instanceof GuestEngine.ThrowCompletion)
    return heldValuesRaw;

  for (let i = 0; i < heldValuesRaw.length; i++) {
    if (heldValuesRaw[i].type !== "Object")
      return GuestEngine.Throw("TypeError", "Raw", `heldValues[${i}] is not an object`);
  }

  const heldValues = heldValuesRaw as readonly GuestEngine.ObjectValue[];

  if (strongRefsGuest?.type !== "Boolean")
    return GuestEngine.Throw("TypeError", "Raw", "strongReferencesOnly is not a boolean");

  return {
    resultsKey: resultsKeyGuest.stringValue(),
    targetValue,
    heldValues,
    strongReferencesOnly: strongRefsGuest.booleanValue(),
  };
}
