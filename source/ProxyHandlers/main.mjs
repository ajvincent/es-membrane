import Base from "./Base.mjs";
import Forwarding from "./Forwarding.mjs";
import {
  LinkedList,
  LinkedListNode,
} from "./LinkedList-old.mjs";
import Tracing from "./Tracing.mjs";
import {
  GraphInvariantIn,
  GraphInvariantOut,
} from "./GraphInvariants.mjs";
import ConvertFromShadow from "./ConvertFromShadow.mjs";
import UpdateShadow from "./UpdateShadow.mjs";
import Master from "./Master.mjs";

/**
 * @public
 */
const MembraneProxyHandlers = {
  Base,
  Forwarding,
  LinkedList,
  LinkedListNode,

  Tracing,
  GraphInvariantIn,
  GraphInvariantOut,
  ConvertFromShadow,
  UpdateShadow,

  Master,
};
Object.freeze(MembraneProxyHandlers);

export default MembraneProxyHandlers;
