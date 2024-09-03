import type {
  MembraneInternalIfc
} from "../types/MembraneInternalIfc.js";

import MembraneInternalError from "./MembraneInternalError.js";

export default function graphAssert(
  condition: boolean,
  message: string,
  membraneIfc: MembraneInternalIfc,
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
