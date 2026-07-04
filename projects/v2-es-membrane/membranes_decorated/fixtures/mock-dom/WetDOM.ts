import {
  randomUUID
} from "node:crypto";

import type {
  WetDOMMocksIfc
} from "./WetDOM_raw.js";

export type {
  WetDOMMocksIfc
};

/* The enclosing of classes inside WetDOMMocks is very intentional.  We're going
to be altering prototypes of classes, etc.  So we want a "clean" set of mocks
every time.
*/

export async function WetDOMMocks(
  enabledDecorators: ReadonlySet<string>
): Promise<WetDOMMocksIfc>
{
  const uuid = randomUUID();
  const { WetDOMMocks: rawMocks } = await import(`./WetDOM_raw.js?uuid=${uuid}`) as Record<"WetDOMMocks", (
    enabledDecorators: ReadonlySet<string>
  ) => WetDOMMocksIfc>;
  return rawMocks(enabledDecorators);
}
