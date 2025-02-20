import {
  GuestEngine
} from "../GuestEngine.js";

import type {
  ReferenceGraphNode
} from "../../types/ReferenceGraph.js";

import {
  BuiltInCollectionName
} from "../../utilities/constants.js";

import type {
  ValueToNumericKeyMap
} from "./ValueToNumericKeyMap.js";

export class ReferenceGraphNodeImpl implements ReferenceGraphNode {
  static #getCollectionAndClassName(
    guestObject: GuestEngine.ObjectValue,
    realm: GuestEngine.ManagedRealm
  ): [BuiltInCollectionName, string]
  {
    if (GuestEngine.isProxyExoticObject(guestObject)) {
      return [BuiltInCollectionName.Proxy, BuiltInCollectionName.Proxy];
    }

    let isDirectMatch = true;
    let value: GuestEngine.ObjectValue = guestObject;

    // this will be fixed in the near future
    // eslint-disable-next-line prefer-const
    let derivedClassName: string = "(unknown)";

    let proto: GuestEngine.ObjectValue | GuestEngine.NullValue = value.GetPrototypeOf();
    while (proto.type !== "Null") {
      switch (proto) {
        case realm.Intrinsics["%Array.prototype%"]:
          return [BuiltInCollectionName.Array, isDirectMatch ? BuiltInCollectionName.Array : derivedClassName];
        case realm.Intrinsics["%Object.prototype%"]:
          return [BuiltInCollectionName.Object, isDirectMatch ? BuiltInCollectionName.Object : derivedClassName];
        case realm.Intrinsics["%WeakRef.prototype%"]:
          return [BuiltInCollectionName.WeakRef, isDirectMatch ? BuiltInCollectionName.WeakRef : derivedClassName];
      }

      isDirectMatch = false;
      value = proto;
      proto = value.GetPrototypeOf();
    }

    return [BuiltInCollectionName.Object, isDirectMatch ? BuiltInCollectionName.Object : derivedClassName];
  }

  readonly objectKey: number;
  readonly builtInClassName: BuiltInCollectionName;
  readonly derivedClassName: string;

  constructor(
    guestObject: GuestEngine.ObjectValue,
    numericKeyMap: ValueToNumericKeyMap<GuestEngine.ObjectValue>,
    realm: GuestEngine.ManagedRealm,
  )
  {
    this.objectKey = numericKeyMap.getKeyForHeldObject(guestObject);
    [
      this.builtInClassName,
      this.derivedClassName
    ] = ReferenceGraphNodeImpl.#getCollectionAndClassName(guestObject, realm);
  }
}