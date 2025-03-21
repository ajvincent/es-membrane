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
  readonly #scopedValueIdentifiers = new Set<string>;
  readonly #localIdentifiers = new Set<string>;

  constructor(
    referenceBuilder: FunctionReferenceBuilder
  )
  {
    this.#referenceBuilder = referenceBuilder;
  }

  searchForValues(
    guestFunction: GuestEngine.FunctionObject,
  ): void
  {
    void(guestFunction);
    void(this.#referenceBuilder);

    this.#scopedValueIdentifiers.clear();
    this.#localIdentifiers.clear();
  }
}
