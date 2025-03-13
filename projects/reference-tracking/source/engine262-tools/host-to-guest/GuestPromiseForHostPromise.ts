
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

  const { Promise, Resolve, Reject } = guestPromiseCompletion.Value;
  GuestEngine.Assert(Promise.type === "Object");
  GuestEngine.Assert(Resolve.type === "Object");
  GuestEngine.Assert(Reject.type === "Object");
  const guestResolver = Resolve as GuestEngine.PromiseResolvingFunctionObject;
  const guestRejecter = Reject as GuestEngine.PromiseResolvingFunctionObject;
  const guestPromise = Promise as GuestEngine.PromiseObject;

  hostPromise.then(
    value => guestResolver.Call(guestPromise, [GuestEngine.Value(value)]),
    error => guestRejecter.Call(guestPromise, [GuestEngine.Value(error as RejectType)])
  );

  HostDefined.registerHostPromise(hostPromise);
  return guestPromise;
}
