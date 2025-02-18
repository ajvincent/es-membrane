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

  return undefined;
}
