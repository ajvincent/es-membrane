import {
  GuestEngine
} from "./GuestEngine.js";

import {
  Deferred,
  PromiseResolver,
  PromiseRejecter
} from "../../utilities/PromiseTypes.js";

export function convertGuestPromiseToVoidHostPromise
(
  guestPromise: GuestEngine.PromiseObject
): Promise<void>
{
  const guestToHostPromise = new VoidGuestToHostPromise(guestPromise);
  return guestToHostPromise.promise;
}

class VoidGuestToHostPromise {
  readonly #resolve: PromiseResolver<void>;
  readonly #reject: PromiseRejecter;

  readonly promise: Promise<void>;

  constructor(
    guestPromise: GuestEngine.PromiseObject,
  )
  {
    const deferred = new Deferred<void>;
    this.#resolve = deferred.resolve;
    this.#reject = deferred.reject;

    const guestResolver = this.#guestResolver.bind(this);
    const resolveCallback = GuestEngine.CreateBuiltinFunction(guestResolver, 0, GuestEngine.Value(""), []);

    const guestRejecter = this.#guestRejecter.bind(this);
    const rejectCallback = GuestEngine.CreateBuiltinFunction(guestRejecter, 1, GuestEngine.Value(""), []);

    const thenBuiltin = GuestEngine.surroundingAgent.intrinsic("%Promise.prototype.then%");
    GuestEngine.Assert(thenBuiltin.type === "Object");
    GuestEngine.Assert(GuestEngine.isFunctionObject(thenBuiltin));

    thenBuiltin.Call(guestPromise, [resolveCallback, rejectCallback]);

    this.promise = deferred.promise;
  }

  #guestResolver(
    guestArguments: readonly GuestEngine.Value[]
  ): GuestEngine.Value {
    void(guestArguments);
    this.#resolve();
    return guestArguments[0];
  }

  #guestRejecter(
    guestArguments: readonly GuestEngine.Value[]
  ): GuestEngine.ThrowCompletion {
    this.#reject("guest promise rejected");
    return GuestEngine.ThrowCompletion(guestArguments[0]);
  }
}