import {
  GuestEngine
} from "../GuestEngine.js";

import {
  InternalSlotTypesEnum
} from "../internalSlotsByType/InternalSlotTypesEnum.js";

export function findInternalSlotsType(
  guestValue: GuestEngine.ObjectValue
): InternalSlotTypesEnum | undefined {
  if (GuestEngine.isProxyExoticObject(guestValue))
    return InternalSlotTypesEnum.Proxy;

  if (GuestEngine.isFunctionObject(guestValue)) {
    if ("RevocableProxy" in guestValue) {
      return InternalSlotTypesEnum.RevokerToProxy;
    }
  }

  if (guestValue.internalSlotsList.includes("WeakRefTarget"))
    return InternalSlotTypesEnum.WeakRef;

  return undefined;
}
