import type {
  GuestEngine
} from "../host-to-guest/GuestEngine.js";

export interface InstanceGetterDefinitions
{
  defineInstanceGetter(
    instance: GuestEngine.ObjectValue,
    getterKey: string | number | GuestEngine.SymbolValue,
  ): GuestEngine.Evaluator<void>;
}
