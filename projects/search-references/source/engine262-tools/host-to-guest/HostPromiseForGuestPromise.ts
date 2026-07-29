import {
  GuestEngine
} from "./GuestEngine.js";

export function convertGuestPromiseToVoidHostPromise
(
  guestPromise: GuestEngine.PromiseObject
): Promise<void>
{
  const guestToHostPromise = new VoidGuestToHostPromise(guestPromise);
  return guestToHostPromise.promise;
}

class VoidGuestToHostPromise {
  readonly #resolve: PromiseWithResolvers<void>["resolve"];
  readonly #reject: PromiseWithResolvers<void>["reject"];

  readonly promise: Promise<void>;

  constructor(
    guestPromise: GuestEngine.PromiseObject,
  )
  {
    const deferred = Promise.withResolvers<void>();
    this.#resolve = deferred.resolve;
    this.#reject = deferred.reject;

    const guestResolver = this.#guestResolver.bind(this);
    const resolveCallback = GuestEngine.CreateBuiltinFunction(guestResolver as GuestEngine.NativeSteps, 0, GuestEngine.Value(""), []);

    const guestRejecter = this.#guestRejecter.bind(this);
    const rejectCallback = GuestEngine.CreateBuiltinFunction(guestRejecter as GuestEngine.NativeSteps, 1, GuestEngine.Value(""), []);

    const thenBuiltin = GuestEngine.surroundingAgent.intrinsic("%Promise.prototype.then%");
    GuestEngine.Assert(thenBuiltin.type === "Object");
    GuestEngine.Assert(GuestEngine.isFunctionObject(thenBuiltin));

    thenBuiltin.Call(guestPromise, [resolveCallback, rejectCallback]);

    this.promise = deferred.promise;
  }

  #guestResolver(
    guestArguments: readonly GuestEngine.Value[]
  ): GuestEngine.Value
  {
    void(guestArguments);
    this.#resolve();
    return guestArguments[0];
  }

  #guestRejecter(
    guestArguments: readonly GuestEngine.Value[]
  ): GuestEngine.ThrowCompletion
  {
    this.#reject("guest promise rejected");
    return GuestEngine.ThrowCompletion(guestArguments[0]);
  }
}
