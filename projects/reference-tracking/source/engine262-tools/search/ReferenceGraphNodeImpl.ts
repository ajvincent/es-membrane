import {
  GuestEngine
} from "../GuestEngine.js";

import type {
  ValueToNumericKeyMap
} from "./ValueToNumericKeyMap.js";

import {
  BuiltInCollectionName,
  ReferenceGraphNode
} from "../../ReferenceGraph.js";

export default class ReferenceGraphNodeImpl implements ReferenceGraphNode {
  readonly objectKey: number;
  readonly builtInCollectionName: BuiltInCollectionName;
  readonly derivedClassName?: string | undefined;

  constructor(
    guestObject: GuestEngine.ObjectValue,
    numericKeyMap: ValueToNumericKeyMap,
  )
  {
    this.objectKey = numericKeyMap.getKeyForHeldObject(guestObject);
    this.builtInCollectionName = BuiltInCollectionName.Object;
  }
}