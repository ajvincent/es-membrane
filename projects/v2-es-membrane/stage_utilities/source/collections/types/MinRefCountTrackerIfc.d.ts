import type {
  PrivateKeyBranded,
  SharedKeyBranded
} from "./KeysBranded.js";

export interface MinRefCountTrackerIfc<StrongKeyType> {
  hasReference(
    sharedKey: SharedKeyBranded,
    strongKey: StrongKeyType,
  ): boolean;

  addReference(
    privateKey: PrivateKeyBranded,
    sharedKey: SharedKeyBranded,
    strongKey: StrongKeyType,
  ): void;

  deleteReference(
    privateKey: PrivateKeyBranded,
    attemptCleanup: boolean,
  ): void;
}
