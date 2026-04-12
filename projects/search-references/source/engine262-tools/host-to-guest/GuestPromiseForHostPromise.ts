
import {
  GuestEngine,
} from "./GuestEngine.js";

import {
  RealmHostDefined
} from "./RealmHostDefined.js";

export function convertHostPromiseToGuestPromise<
  ResolveType extends string | number | boolean | bigint | undefined,
  RejectType extends string | number | boolean | bigint | undefined,
>
(
  realm: GuestEngine.ManagedRealm,
  hostPromise: Promise<ResolveType>
): GuestEngine.PromiseObject
{
  const guestPromiseCompletion = GuestEngine.NewPromiseCapability(realm.Intrinsics["%Promise%"]);
  GuestEngine.Assert(guestPromiseCompletion instanceof GuestEngine.NormalCompletion);

  const { HostDefined } = realm;
  GuestEngine.Assert(HostDefined instanceof RealmHostDefined);

  const {
    Promise: guestPromise,
    Resolve: guestResolver,
    Reject: guestRejecter
  } = guestPromiseCompletion.Value as GuestEngine.PromiseCapabilityRecord;

  hostPromise.then(
    value => guestResolver.Call(guestPromise, [GuestEngine.Value(value)]),
    error => guestRejecter.Call(guestPromise, [GuestEngine.Value(error as RejectType)])
  );

  HostDefined.registerHostPromise(hostPromise);
  return guestPromise;
}
