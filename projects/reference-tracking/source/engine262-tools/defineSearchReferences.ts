import type {
  ReadonlyDeep
} from "type-fest";

import {
  GuestEngine
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

export function defineSearchReferences(
  realm: GuestEngine.ManagedRealm,
  searchResultsArray: (ReadonlyDeep<ReferenceGraph>)[]
): void
{
  defineBuiltInFunction(
    realm, "searchReferences",
    function performSearch(
      guestThisArg: GuestEngine.Value,
      guestArguments: readonly GuestEngine.Value[],
      guestNewTarget: GuestEngine.Value
    ): GuestEngine.BooleanValue | GuestEngine.ThrowCompletion
    {
      void(guestThisArg);
      void(guestNewTarget);

      const heldValues = convertArrayValueToArrayOfValues(guestArguments[1]);
      if (!Array.isArray(heldValues))
        return heldValues;

      const searchDriver = new SearchDriver(
        guestArguments[0],
        heldValues,
        guestArguments[2] === GuestEngine.Value.true
      );
      searchResultsArray.push(searchDriver);

      searchDriver.run();
      return searchDriver.succeeded ? GuestEngine.Value.true : GuestEngine.Value.false;
    }
  )
}
