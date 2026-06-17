import {
  GuestEngine
} from "../host-to-guest/GuestEngine.js";

export class HostValueSubstitution
{
  readonly #objectMap = new WeakMap<GuestEngine.ObjectValue, object>;
  readonly #symbolMap = new WeakMap<GuestEngine.SymbolValue, symbol>;
  readonly #privateKeysMap = new WeakMap<GuestEngine.PrivateName, symbol>;

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
      const { Description } = guestSymbol;
      const hostDescription = (Description.type === "String") ? Description.stringValue() : undefined;
      hostSymbol = Symbol(hostDescription);
      this.#symbolMap.set(guestSymbol, hostSymbol);
    }
    return hostSymbol;
  }

  public getHostPrivateName(
    guestKey: GuestEngine.PrivateName
  ): symbol
  {
    let hostObject: symbol | undefined = this.#privateKeysMap.get(guestKey);
    if (!hostObject) {
      const hostDescription = guestKey.Description.stringValue();
      if (hostDescription.startsWith("#") === false)
        throw new Error("expected description to start with #");
      hostObject = Symbol(hostDescription);
      this.#privateKeysMap.set(guestKey, hostObject);
    }
    return hostObject;
  }
}
