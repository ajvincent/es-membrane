import type {
  ReadonlyDeep
} from "type-fest";

import {
  GuestEngine,
  type ThrowOr,
} from "./GuestEngine.js";

import {
  defineBuiltInFunction
} from "./defineBuiltInFunction.js";

import type {
  ReferenceGraph
} from "../ReferenceGraph.js";

import {
  SearchDriver
} from "./search/Driver.js";

import {
  convertArrayValueToArrayOfValues
} from "./convertArrayValueToArrayOfValues.js";

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
    realm, "searchReferences",
    function performGuestSearch(
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
        return GuestEngine.Throw("Error", "Raw", "You already have a search with that results key");
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
  if (resultsKeyGuest.type !== "String") {
    return GuestEngine.Throw("TypeError", "Raw", "resultsKey is not a string");
  }

  if (targetValue.type !== "Object") {
    return GuestEngine.Throw("TypeError", "NotAnObject", targetValue);
  }
  const heldValues = convertArrayValueToArrayOfValues(heldValuesArrayGuest);
  if (heldValues instanceof GuestEngine.ThrowCompletion)
    return heldValues;
  if (!isObjectValueArray(heldValues)) {
    return GuestEngine.Throw("TypeError", "Raw", "heldValues is not an array of objects");
  }

  if (strongRefsGuest.type !== "Boolean")
    return GuestEngine.Throw("TypeError", "Raw", "strongReferences is not a boolean");

  return {
    resultsKey: resultsKeyGuest.stringValue(),
    targetValue,
    heldValues,
    strongReferencesOnly: strongRefsGuest.booleanValue(),
  };
}

function isObjectValueArray(
  valuesArray: readonly GuestEngine.Value[]
): valuesArray is readonly GuestEngine.ObjectValue[]
{
  return valuesArray.every(value => value.type === "Object");
}
