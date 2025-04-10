import type {
  GuestEngine
} from "../host-to-guest/GuestEngine.js";

export interface InstanceGetterDefinitions<EngineObject, EngineSymbol>
{
  defineInstanceGetter(
    instance: EngineObject,
    getterKey: string | number | EngineSymbol,
  ): GuestEngine.Evaluator<void>;
}
