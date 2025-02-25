/*
import type {
  ReadonlyDeep
} from "type-fest";

import type {
  ReferenceGraph
} from "../../types/ReferenceGraph.js";
*/

import {
  GuestEngine,
  type ThrowOr,
} from "../GuestEngine.js";

import {
  convertArrayValueToArrayOfValues
} from "../convertArrayValueToArrayOfValues.js";

/*
import {
  SearchDriver
} from "../search/Driver.js";
*/

import {
  defineBuiltInFunction
} from "./defineBuiltInFunction.js";

interface SearchReferencesArguments {
  readonly resultsKey: string;
  readonly targetValue: GuestEngine.ObjectValue,
  readonly heldValuesArray: GuestEngine.ObjectValue,
  readonly strongReferencesOnly: boolean,
}

export function defineSearchReferences(
  this: void,
  realm: GuestEngine.ManagedRealm,
  /*
  searchResultsMap: Map<string, ReadonlyDeep<ReferenceGraph>>,
  */
): void
{
  defineBuiltInFunction(
    realm, "searchReferences", function performGuestSearch(
      this: void,
      guestThisArg: GuestEngine.Value,
      guestArguments: readonly GuestEngine.Value[],
      guestNewTarget: GuestEngine.Value
    ): ThrowOr<GuestEngine.UndefinedValue>
    {
      void(guestThisArg);
      void(guestNewTarget);

      const searchArgs: ThrowOr<SearchReferencesArguments> = extractSearchParameters(guestArguments);
      if (searchArgs instanceof GuestEngine.ThrowCompletion)
        return searchArgs;

      /*
      if (searchResultsMap.has(searchArgs.resultsKey)) {
        return GuestEngine.Throw("Error", "Raw",
          `You already have a search with the results key ${JSON.stringify(searchArgs.resultsKey)}`
        );
      }

      const searchDriver = new SearchDriver(
        searchArgs.targetValue,
        searchArgs.heldValuesArray,
        searchArgs.strongReferencesOnly,
        realm,
      );

      const graph: ThrowOr<ReadonlyDeep<ReferenceGraph> | undefined> = searchDriver.run();
      if (graph instanceof GuestEngine.ThrowCompletion)
        return graph;

      if (graph)
        searchResultsMap.set(searchArgs.resultsKey, graph);
      */

      return GuestEngine.Value.undefined;
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
  if (heldValuesArrayGuest.type !== "Object") {
    return GuestEngine.Throw('TypeError', "Raw", "Expected an Array object");
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

  if (strongRefsGuest?.type !== "Boolean")
    return GuestEngine.Throw("TypeError", "Raw", "strongReferencesOnly is not a boolean");

  return {
    resultsKey: resultsKeyGuest.stringValue(),
    targetValue,
    heldValuesArray: heldValuesArrayGuest,
    strongReferencesOnly: strongRefsGuest.booleanValue(),
  };
}
