interface SlotData {
  holdsKeyStrongly: boolean;
  fromConstructorArg: string | undefined;
}

export class ReferenceDefinitions {
  readonly #keyedSlots = new Map<string, SlotData>;
  readonly keyedSlots: ReadonlyMap<string, SlotData> = this.#keyedSlots;

  readonly #valueSlots = new Map<string, string | undefined>;
  readonly valueSlots: ReadonlyMap<string, string | undefined> = this.#valueSlots;

  defineKeyedSlot(slotName: string, holdsKeyStrongly: boolean, fromConstructorArg: string | undefined): void {
    this.#keyedSlots.set(slotName, { holdsKeyStrongly, fromConstructorArg });
  }

  defineValueSlot(slotName: string, fromConstructorArg: string | undefined): void {
    this.#valueSlots.set(slotName, fromConstructorArg);
  }
}
