import {
  GuestEngine,
} from "../host-to-guest/GuestEngine.js";

export interface FunctionReferenceBuilder {
  buildFunctionValueReference(
    guestFunction: GuestEngine.FunctionObject,
    nameOfValue: string,
    guestValue: GuestEngine.Value,
  ): void;
}

export class FunctionStatementSearch {
  readonly #referenceBuilder: FunctionReferenceBuilder;

  constructor(
    referenceBuilder: FunctionReferenceBuilder
  )
  {
    this.#referenceBuilder = referenceBuilder;
  }

  searchForValues(
    guestFunction: GuestEngine.ECMAScriptFunctionObject,
  ): void
  {
    const visitedNames = new Set<string>;
    let env: GuestEngine.EnvironmentRecord | GuestEngine.NullValue = guestFunction.Environment;
    while (env instanceof GuestEngine.FunctionEnvironmentRecord) {
      for (const [guestName, guestValue] of env.bindings.entries()) {
        const hostName = guestName.stringValue();
        if (visitedNames.has(hostName))
          continue;
        visitedNames.add(hostName);

        this.#referenceBuilder.buildFunctionValueReference(
          guestFunction, hostName, guestValue.value ?? GuestEngine.Value.undefined
        );
      }
      env = env.OuterEnv;
    }
  }
}
