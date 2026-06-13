import type {
  SearchConfiguration
} from "../../public/core-host/types/SearchConfiguration.js";

import {
  GuestEngine
} from "../host-to-guest/GuestEngine.js";

import { defineBuiltInFunction } from "./defineBuiltInFunction.js";

export function * definePrintFunction(
  realm: GuestEngine.ManagedRealm,
  searchConfiguration: SearchConfiguration
)
{
  // eslint-disable-next-line require-yield
  yield * defineBuiltInFunction(realm, "print", function * print(
    guestThisArg: GuestEngine.Value,
    guestArguments: readonly GuestEngine.Value[],
    guestNewTarget: GuestEngine.Value
  ): GuestEngine.Evaluator<GuestEngine.Value> {
    void (guestThisArg);
    void (guestNewTarget);

    const values: readonly string[] = guestArguments.map((tmp) => GuestEngine.inspect(tmp));
    if (searchConfiguration.printToScriptLog)
      searchConfiguration.printToScriptLog(...values);

    return GuestEngine.Value(undefined);
  });
}
