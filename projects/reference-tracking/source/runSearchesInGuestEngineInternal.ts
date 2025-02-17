import type {
  ReadonlyDeep
} from "type-fest";

import type {
  ReferenceGraph
} from "./ReferenceGraph.js";

import {
  GuestEngine,
  type ThrowOr
} from "./engine262-tools/GuestEngine.js";

import {
  defineReportFunction
} from "./engine262-tools/built-ins/fixtures/defineReportFunction.js";

import {
  defineSearchReferences
} from "./engine262-tools/built-ins/defineSearchReferences.js";

import {
  directInvoke
} from "./engine262-tools/directInvoke.js";

import type {
  GuestRealmOutputs
} from "./engine262-tools/types/Virtualization262.js";

export interface InternalSearchResults {
  readonly graphs: ReadonlyDeep<Map<string, ReferenceGraph>>;
  readonly reportCalls: ReadonlyMap<string, string | number | boolean | undefined | null>;
}

export async function runSearchesInGuestEngineInternal(
  absolutePathToFile: string,
): Promise<ReadonlyDeep<InternalSearchResults>> {
  const graphs = new Map<string, ReferenceGraph>;
  const reportCalls = new Map<string, string | number | boolean | undefined | null>;

  const outputs: GuestRealmOutputs = await directInvoke({
    absolutePathToFile,
    defineBuiltIns: (realm: GuestEngine.ManagedRealm): void => {
      defineReportFunction(realm, (guestValues) => handleReport(guestValues, reportCalls));
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

function handleReport(
  guestValues: readonly GuestEngine.Value[],
  reportCalls: Map<string, string | number | boolean | undefined | null>
): ThrowOr<GuestEngine.UndefinedValue> {
  const [keyGuest, valueGuest] = guestValues;
  if (keyGuest?.type !== "String")
    return GuestEngine.Throw("TypeError", "Raw", "key must be a string");

  const key: string = keyGuest.stringValue();
  if (reportCalls.has(key))
    return GuestEngine.Throw("Error", "Raw", `key "${key}" is already defined`);

  if (valueGuest === undefined || valueGuest.type === "Undefined")
    reportCalls.set(key, undefined);
  else if (valueGuest.type === "String")
    reportCalls.set(key, valueGuest.stringValue());
  else if (valueGuest.type === "Boolean")
    reportCalls.set(key, valueGuest.booleanValue());
  else if (valueGuest.type === "Number")
    reportCalls.set(key, valueGuest.numberValue());
  else if (valueGuest.type === "Null")
    reportCalls.set(key, null);

  else
    return GuestEngine.Throw("TypeError", "Raw", `value must be undefined, a string, a boolean, a number, or null.`);
  return GuestEngine.Value.undefined;
}
