import type {
  Graph,
} from "@dagrejs/graphlib";

import type {
  EngineWeakKey
} from "../../graph-analysis/types/ObjectGraphIfc.js";

import type {
  SearchConfiguration,
} from "../../public/core-host/types/SearchConfiguration.js";

import {
  EnsureTypeOrThrow
} from "../host-to-guest/EnsureTypeOrThrow.js";

import {
  GuestEngine,
} from "../host-to-guest/GuestEngine.js";

import {
  convertArrayValueToArrayOfValues
} from "../host-to-guest/convertArrayValueToArrayOfValues.js";

import {
  SearchDriver
} from "../search/SearchDriver.js";

import {
  defineBuiltInFunction
} from "./defineBuiltInFunction.js";

interface SearchReferencesArguments {
  readonly resultsKey: string;
  readonly targetValue: EngineWeakKey<GuestEngine.ObjectValue, GuestEngine.SymbolValue>,
  readonly heldValuesArray: GuestEngine.ObjectValue,
  readonly strongReferencesOnly: boolean,
}

export function * defineSearchReferences(
  this: void,
  realm: GuestEngine.ManagedRealm,
  searchResultsMap: Map<string, Graph | null>,
  searchConfiguration?: SearchConfiguration
): GuestEngine.Evaluator<void>
{
  yield* defineBuiltInFunction(
    realm, "searchReferences", function * performGuestSearch(
      this: void,
      guestThisArg: GuestEngine.Value,
      guestArguments: readonly GuestEngine.Value[],
      guestNewTarget: GuestEngine.Value
    ): GuestEngine.Evaluator<GuestEngine.UndefinedValue>
    {
      void(guestThisArg);
      void(guestNewTarget);

      const searchArgs: SearchReferencesArguments = yield* EnsureTypeOrThrow(extractSearchParameters(guestArguments));

      if (searchResultsMap.has(searchArgs.resultsKey)) {
        throw GuestEngine.Throw("Error", "Raw",
          `You already have a search with the results key ${JSON.stringify(searchArgs.resultsKey)}`
        );
      }

      const searchDriver = new SearchDriver(
        searchArgs.targetValue,
        searchArgs.heldValuesArray,
        searchArgs.strongReferencesOnly,
        realm,
        searchArgs.resultsKey,
        searchConfiguration
      );

      const graphOrNull: Graph | null = yield* searchDriver.run();

      searchResultsMap.set(searchArgs.resultsKey, graphOrNull);
      return GuestEngine.Value.undefined;
    }
  )
}

function * extractSearchParameters(
  this: void,
  guestArguments: readonly GuestEngine.Value[],
): GuestEngine.Evaluator<SearchReferencesArguments>
{
  const [resultsKeyGuest, targetValue, heldValuesArrayGuest, strongRefsGuest] = guestArguments;
  if (resultsKeyGuest?.type !== "String") {
    throw GuestEngine.Throw("TypeError", "Raw", "resultsKey is not a string");
  }

  if (targetValue?.type !== "Object" && targetValue?.type !== "Symbol") {
    throw GuestEngine.Throw("TypeError", "NotAWeakKey", targetValue);
  }

  if (heldValuesArrayGuest.type !== "Object") {
    throw GuestEngine.Throw('TypeError', "Raw", "Expected an Array object");
  }
  const heldValuesRaw: GuestEngine.Value[] = yield* EnsureTypeOrThrow(convertArrayValueToArrayOfValues(
    heldValuesArrayGuest
  ));

  for (let i = 0; i < heldValuesRaw.length; i++) {
    if (heldValuesRaw[i].type !== "Object" && heldValuesRaw[i].type !== "Symbol")
      throw GuestEngine.Throw("TypeError", "NotAWeakKey", heldValuesRaw[i]);
  }

  if (strongRefsGuest?.type !== "Boolean")
    throw GuestEngine.Throw("TypeError", "Raw", "strongReferencesOnly is not a boolean");

  return {
    resultsKey: resultsKeyGuest.stringValue(),
    targetValue,
    heldValuesArray: heldValuesArrayGuest,
    strongReferencesOnly: strongRefsGuest.booleanValue(),
  };
}
