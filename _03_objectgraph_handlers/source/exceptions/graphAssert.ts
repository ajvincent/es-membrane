import type {
  MembraneBaseIfc
} from "../types/MembraneBaseIfc.js";

import MembraneInternalError from "./MembraneInternalError.js";

export default function graphAssert(
  condition: boolean,
  message: string,
  membraneIfc: MembraneBaseIfc,
  graphName: string | symbol,
): asserts condition is true
{
  if (condition)
    return;

  try {
    membraneIfc.notifyAssertionFailed(graphName);
  }
  catch (ex) {
    // do nothing
  }

  throw new MembraneAssertionError(message);
}

class MembraneAssertionError extends MembraneInternalError {
  // deliberately empty
}
