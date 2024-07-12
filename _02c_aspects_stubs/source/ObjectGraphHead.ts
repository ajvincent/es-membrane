import ForwardToReflect from "./generated/ForwardToReflect.js";
import type {
  ObjectGraphHeadIfc
} from "./types/ObjectGraphHeadIfc.js";

export default
class ObjectGraphHead
extends ForwardToReflect<object> implements ObjectGraphHeadIfc
{
  readonly objectGraphKey: string | symbol;

  constructor(objectGraphKey: string | symbol) {
    super();
    this.objectGraphKey = objectGraphKey;
  }

  createNewProxy<T extends object>(realTarget: T): T {
    throw new Error("Method not implemented.");
  }

  revokeAllProxies(): void {
    throw new Error("Method not implemented.");
  }
}