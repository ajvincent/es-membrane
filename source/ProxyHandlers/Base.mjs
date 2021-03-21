import {
  allTraps,
} from "../core/utilities/shared.mjs";

function NOT_IMPLEMENTED() {
  throw new Error("Not implemented!");
}

// A ProxyHandler base prototype, for instanceof checks.
/**
 * @package
 */
const Base = class {};
allTraps.forEach(trapName => Base.prototype[trapName] = NOT_IMPLEMENTED);

export default Base;
