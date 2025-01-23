import {
  ReadonlyDeep,
} from "type-fest";

import {
  BuiltInCollections
} from "./utilities/BuiltInCollections.js";

import {
  COLLECT_REFERENCES,
  ReferenceDescription,
  ReferenceDescriptionGetter,
  ReferenceDescriptionIfc,
} from "./utilities/ReferenceDescription.js";

import isObjectOrSymbol from "./utilities/isObjectOrSymbol.js";

class FinalizationCell<T> {
  readonly targetRef: WeakRef<WeakKey>;
  readonly heldValue: T;
  readonly unregisterTokenRef?: WeakRef<WeakKey>;

  constructor(target: WeakKey, heldValue: T, unregisterToken?: WeakKey) {
    this.targetRef = new WeakRef(target);
    this.heldValue = heldValue;
    if (unregisterToken) {
      this.unregisterTokenRef = new WeakRef(unregisterToken);
    }
  }

  matchesUnregisterToken(unregisterToken: WeakKey): boolean {
    return this.unregisterTokenRef?.deref() === unregisterToken;
  }
}

// @see {@link https://tc39.es/ecma262/#sec-finalization-registry-objects}
export class FinalizationRegistryTracking<T>
extends BuiltInCollections.FinalizationRegistry<T>
implements ReferenceDescriptionGetter
{
  readonly #originalCallback: (heldValue: T) => void;
  readonly #cells = new Set<FinalizationCell<T>>;

  #flushCellsOfHeldValue(heldValue: T): void {
    for (const cell of this.#cells.values()) {
      if (cell.heldValue === heldValue)
        this.#cells.delete(cell);
    }
  }

  constructor(cleanupCallback: (heldValue: T) => void) {
    super((heldValue: T): void => {
      this.#flushCellsOfHeldValue(heldValue);
      cleanupCallback(heldValue);
    });

    this.#originalCallback = cleanupCallback;
  }

  public register(target: WeakKey, heldValue: T, unregisterToken?: WeakKey): void {
    super.register(target, heldValue, unregisterToken);
    this.#cells.add(new FinalizationCell<T>(target, heldValue, unregisterToken));
  }

  public unregister(unregisterToken: WeakKey): boolean {
    const result = super.unregister(unregisterToken);

    for (const cell of this.#cells) {
      if (cell.matchesUnregisterToken(unregisterToken))
        this.#cells.delete(cell);
    }

    return result;
  }

  public [COLLECT_REFERENCES](): ReadonlyDeep<ReferenceDescriptionIfc[]> {
    const refs: ReferenceDescription[] = [];
    refs.push(new ReferenceDescription("FinalizationRegistry", [this], this.#originalCallback, true, ["[[CleanupCallback]]"]));

    for (const cell of this.#cells) {
      const target = cell.targetRef.deref();
      if (!target)
        continue;

      if (isObjectOrSymbol(cell.heldValue) === true)
        refs.push(new ReferenceDescription("FinalizationRegistry", [this, target], cell.heldValue, true, ["heldValue"]));

      const unregisterToken: WeakKey | undefined = cell.unregisterTokenRef?.deref();
      if (unregisterToken) {
        refs.push(new ReferenceDescription("FinalizationRegistry", [this, target], unregisterToken, false, ["unregisterToken"]));
      }
    }

    return refs;
  }
}
