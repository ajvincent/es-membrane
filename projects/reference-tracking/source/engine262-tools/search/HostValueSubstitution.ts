import {
  GuestEngine
} from "../host-to-guest/GuestEngine.js";

export class HostValueSubstitution
{
  readonly #objectMap = new WeakMap<GuestEngine.ObjectValue, object>;
  readonly #symbolMap = new WeakMap<GuestEngine.SymbolValue, symbol>;

  public getHostValue(guestValue: GuestEngine.Value)
  {
    switch (guestValue.type) {
      case "BigInt":
        return guestValue.bigintValue();

      case "Boolean":
        return guestValue.booleanValue();

      case "Null":
        return null;

      case "Object":
        return this.getHostObject(guestValue);

      case "Undefined":
        return undefined;

      default:
        return this.getHostPropertyKey(guestValue);
    }
  }

  public getHostPropertyKey(
    guestValue: GuestEngine.JSStringValue | GuestEngine.NumberValue | GuestEngine.SymbolValue
  ): string | number | symbol
  {
    switch (guestValue.type) {
      case "Number":
        return guestValue.numberValue();

      case "String":
        return guestValue.stringValue();

      case "Symbol":
        return this.getHostSymbol(guestValue);
    }
  }

  public getHostWeakKey(
    guestValue: GuestEngine.ObjectValue | GuestEngine.SymbolValue
  ): object | symbol
  {
    return guestValue.type === "Object" ? this.getHostObject(guestValue) : this.getHostSymbol(guestValue);
  }

  public getHostObject(
    guestObject: GuestEngine.ObjectValue
  ): object
  {
    let hostObject: object | undefined = this.#objectMap.get(guestObject);
    if (!hostObject) {
      if (GuestEngine.IsCallable(guestObject) || GuestEngine.IsConstructor(guestObject))
        hostObject = function() {};
      else
        hostObject = {};

      this.#objectMap.set(guestObject, hostObject);
    }
    return hostObject;
  }

  public getHostSymbol(
    guestSymbol: GuestEngine.SymbolValue,
  ): symbol
  {
    let hostSymbol: symbol | undefined = this.#symbolMap.get(guestSymbol);
    if (!hostSymbol) {
      hostSymbol = Symbol();
      this.#symbolMap.set(guestSymbol, hostSymbol);
    }
    return hostSymbol;
  }
}
