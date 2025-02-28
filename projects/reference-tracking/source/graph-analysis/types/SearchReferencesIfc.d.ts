export interface SearchReferencesIfc {
  setStrongReferenceCallback(
    callback: (object: object) => void
  ): void;

  markStrongReferencesFromHeldValues(): void;

  isObjectHeldStrongly(
    object: object
  ): boolean;

  summarizeGraphToTarget(): void;
}
