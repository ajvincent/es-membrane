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
    if (guestFunction.Environment instanceof GuestEngine.DeclarativeEnvironmentRecord) {
      for (const [guestName, guestValue] of guestFunction.Environment.bindings.entries()) {
        this.#referenceBuilder.buildFunctionValueReference(
          guestFunction, guestName.stringValue(), guestValue.value ?? GuestEngine.Value.undefined
        );
      }
    }
  }
}
