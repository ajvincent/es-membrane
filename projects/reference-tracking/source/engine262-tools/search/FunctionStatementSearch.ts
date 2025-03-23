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
    if (env instanceof GuestEngine.FunctionEnvironmentRecord) {
      if (env.HasThisBinding().booleanValue()) {
        const thisBinding = env.GetThisBinding();
        GuestEngine.Assert(thisBinding instanceof GuestEngine.Value);

        this.#referenceBuilder.buildFunctionValueReference(
          guestFunction, "this", thisBinding
        )
      }

      if (env.HasSuperBinding().booleanValue()) {
        const superBinding = env.GetSuperBase();
        this.#referenceBuilder.buildFunctionValueReference(
          guestFunction, "super", superBinding
        );
      }
    }

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
