/** @module source/core/broadcasters/FunctionCallMessage.mjs */

import {
  defineNWNCProperties,
} from "../utilities/shared.mjs";
import ProxyMessageBase from "./ProxyMessageBase.mjs";

export default class CallMessage extends ProxyMessageBase {
  constructor(trapName, realTarget, args, thisObject) {
    super();

    defineNWNCProperties(this, {
      /** @public */
      trapName,

      /** @public */
      realTarget,

      /** @public */
      args,

      /** @public */
      thisObject,
    }, true);
  }
}
