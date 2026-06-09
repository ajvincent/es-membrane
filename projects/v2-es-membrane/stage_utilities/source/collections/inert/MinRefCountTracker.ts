import type {
  MinRefCountTrackerIfc
} from "../types/MinRefCountTrackerIfc.js";

import type {
  PrivateKeyBranded,
  SharedKeyBranded,
} from "../KeysBranded.js";

export class InertMinRefCountTracker<StrongKeyType>
implements MinRefCountTrackerIfc<StrongKeyType>
{
  public hasReference(
    sharedKey: SharedKeyBranded,
    strongKey: StrongKeyType
  ): boolean
  {
    void sharedKey;
    void strongKey;
    return false;
  }

  public addReference(
    privateKey: PrivateKeyBranded,
    sharedKey: SharedKeyBranded,
    strongKey: StrongKeyType
  ): void
  {
    void privateKey;
    void sharedKey;
    void strongKey;
  }

  public deleteReference(
    privateKey: PrivateKeyBranded,
    attemptCleanup: boolean
  ): void
  {
    void privateKey;
    void attemptCleanup;
  }
}
