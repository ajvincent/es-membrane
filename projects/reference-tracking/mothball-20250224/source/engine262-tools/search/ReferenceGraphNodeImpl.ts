import {
  GuestEngine
} from "../GuestEngine.js";

import type {
  ReferenceGraphNode
} from "../../types/ReferenceGraph.js";

import {
  BuiltInJSTypeName
} from "../../utilities/constants.js";

import type {
  ValueToNumericKeyMap
} from "./ValueToNumericKeyMap.js";

export class ReferenceGraphNodeImpl implements ReferenceGraphNode {
  static #getCollectionAndClassName(
    guestObject: GuestEngine.ObjectValue,
    realm: GuestEngine.ManagedRealm
  ): [BuiltInJSTypeName, string]
  {
    if (GuestEngine.isProxyExoticObject(guestObject)) {
      return [BuiltInJSTypeName.Proxy, BuiltInJSTypeName.Proxy];
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
          return [BuiltInJSTypeName.Array, isDirectMatch ? BuiltInJSTypeName.Array : derivedClassName];
        case realm.Intrinsics["%Object.prototype%"]:
          return [BuiltInJSTypeName.Object, isDirectMatch ? BuiltInJSTypeName.Object : derivedClassName];
        case realm.Intrinsics["%WeakRef.prototype%"]:
          return [BuiltInJSTypeName.WeakRef, isDirectMatch ? BuiltInJSTypeName.WeakRef : derivedClassName];
      }

      isDirectMatch = false;
      value = proto;
      proto = value.GetPrototypeOf();
    }

    return [BuiltInJSTypeName.Object, isDirectMatch ? BuiltInJSTypeName.Object : derivedClassName];
  }

  readonly objectKey: number;
  readonly builtInJSTypeName: BuiltInJSTypeName;
  readonly derivedClassName: string;

  constructor(
    guestObject: GuestEngine.ObjectValue,
    numericKeyMap: ValueToNumericKeyMap<GuestEngine.ObjectValue>,
    realm: GuestEngine.ManagedRealm,
  )
  {
    this.objectKey = numericKeyMap.getKeyForHeldObject(guestObject);
    [
      this.builtInJSTypeName,
      this.derivedClassName
    ] = ReferenceGraphNodeImpl.#getCollectionAndClassName(guestObject, realm);
  }
}