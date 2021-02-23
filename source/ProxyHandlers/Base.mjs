import {
  NOT_IMPLEMENTED,
  allTraps,
} from "./sharedUtilities.mjs";

// A ProxyHandler base prototype, for instanceof checks.
/**
 * @package
 */
const Base = class {};
allTraps.forEach(trapName => Base.prototype[trapName] = NOT_IMPLEMENTED);

export default Base;
