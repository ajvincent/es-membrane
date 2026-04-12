import * as GuestEngine from '@magic-works/engine262';

export function * defineBuiltInFunction(
  realm: GuestEngine.ManagedRealm,
  name: string,
  /* argumentsLength: number */
  callback: (
    guestThisArg: GuestEngine.Value,
    guestArguments: readonly GuestEngine.Value[],
    guestNewTarget: GuestEngine.Value
  ) => GuestEngine.Evaluator<GuestEngine.Value>
): GuestEngine.Evaluator<void>
{
  const argumentsLength = 1;
  function * builtInConverter(
    guestArguments: readonly GuestEngine.Value[],
    thisAndNewValue: { thisValue: GuestEngine.Value, NewTarget: GuestEngine.Value }
  ): GuestEngine.ValueEvaluator<GuestEngine.Value>
  {
    try {
      return yield* callback(thisAndNewValue.thisValue, guestArguments, thisAndNewValue.NewTarget);
    }
    catch (ex: unknown) {
      if (ex instanceof GuestEngine.ThrowCompletion)
        return ex;
      return GuestEngine.Throw.Error("HostDefinedError: " + String(ex));
    }
  }

  const builtInName = GuestEngine.Value(name);

  const builtInCallback = GuestEngine.CreateBuiltinFunction(
    builtInConverter as GuestEngine.NativeSteps, argumentsLength, builtInName, []
  );
  yield * GuestEngine.CreateDataProperty(realm.GlobalObject, builtInName, builtInCallback);
}
