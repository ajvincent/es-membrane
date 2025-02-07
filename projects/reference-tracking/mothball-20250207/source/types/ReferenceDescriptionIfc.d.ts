export interface ReferenceDescriptionIfc {
  readonly collectionName: string;
  readonly jointOwners: ReadonlySet<WeakKey>;
  readonly referencedValue: WeakKey;
  readonly isStrongReference: boolean;
  readonly contextPrimitives: readonly unknown[];
}
