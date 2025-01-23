import {
  BuiltInCollections
} from "./BuiltInCollections.js";

export class WeakRefSet<T extends WeakKey> {
  #finalizerCallback = (ref: WeakRef<T>) => {
    this.#references.delete(ref);
  }

  #valueToRef = new BuiltInCollections.WeakMap<T, WeakRef<T>>();
  #references = new BuiltInCollections.Set<WeakRef<T>>;

  #finalizer = new BuiltInCollections.FinalizationRegistry<WeakRef<T>>(this.#finalizerCallback);

  public addReference(
    value: T
  ): void
  {
    let ref: WeakRef<T> | undefined = this.#valueToRef.get(value);
    if (!ref) {
      ref = new BuiltInCollections.WeakRef(value);
      this.#valueToRef.set(value, ref);
      this.#finalizer.register(value, ref, value);
      this.#references.add(ref);
    }
  }

  public hasReference(
    value: T
  ): boolean
  {
    return this.#valueToRef.has(value);
  }

  public getReference(value: T): WeakRef<T> | undefined {
    return this.#valueToRef.get(value);
  }

  public deleteReference(value: T): boolean {
    const ref = this.#valueToRef.get(value);
    if (!ref)
      return false;
    this.#valueToRef.delete(value);
    this.#references.delete(ref);
    this.#finalizer.unregister(value);
    return true;
  }

  public * liveReferences(): IterableIterator<WeakRef<T>> {
    for (const ref of this.#references.values()) {
      const value: T | undefined = ref.deref();
      if (value)
        yield ref;
      else {
        this.#references.delete(ref);
        this.#finalizer.unregister(ref);
      }
    }
  }

  public * liveElements(): IterableIterator<T> {
    for (const ref of this.liveReferences()) {
      yield ref.deref()!;
    }
  }

  public clearReferences(): void {
    this.#finalizer = new BuiltInCollections.FinalizationRegistry(this.#finalizerCallback);
    this.#valueToRef = new BuiltInCollections.WeakMap;
    this.#references = new BuiltInCollections.Set;
  }
}
