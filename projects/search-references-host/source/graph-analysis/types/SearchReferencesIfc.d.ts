export interface SearchReferencesIfc {
  setStrongReferenceCallback(
    callback: (key: WeakKey) => void
  ): void;

  markStrongReferencesFromHeldValues(): void;

  isKeyHeldStrongly(
    weakKey: WeakKey
  ): boolean;

  summarizeGraphToTarget(
    strongReferencesOnly: boolean
  ): void;
}
