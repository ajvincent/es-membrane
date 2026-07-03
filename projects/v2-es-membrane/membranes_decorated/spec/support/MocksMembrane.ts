import {
  Membrane,
} from "../../source/Membrane.js";

import type {
  MembraneIfc,
} from "../../source/types/MembraneIfc.js";

import {
  WetDOMMocks,
  type WetDOMMocksIfc,
} from "../../fixtures/mock-dom/WetDOM.js";

import type {
  MockDocumentIfc
} from "../../fixtures/mock-dom/types/MockDOMInterfaces.js";

export interface MembraneMocksIfc<IncludeDamp extends boolean> {
  readonly membrane: MembraneIfc;
  readonly wetDocument: MockDocumentIfc;
  readonly dryDocument: MockDocumentIfc;
  readonly dampDocument: IncludeDamp extends true ? MockDocumentIfc : undefined;
}

export function MocksMembrane<IncludeDamp extends boolean>(
  enabledDecorators: ReadonlySet<string>,
  includeDamp: IncludeDamp
): MembraneMocksIfc<IncludeDamp>
{
  const { wetDocument }: WetDOMMocksIfc = WetDOMMocks(enabledDecorators);
  const membrane: MembraneIfc = new Membrane();
  membrane.createObjectGraph("wet");
  membrane.createObjectGraph("dry");

  const dryDocument: MockDocumentIfc = membrane.convertObject("wet", "dry", wetDocument);
  if (!includeDamp) {
    return {
      wetDocument,
      membrane,
      dryDocument,
      dampDocument: undefined,
    } as MembraneMocksIfc<IncludeDamp>;
  }

  membrane.createObjectGraph("damp");
  const dampDocument: MockDocumentIfc = membrane.convertObject("wet", "damp", wetDocument);

  return {
    wetDocument,
    membrane,
    dryDocument,
    dampDocument,
  } as MembraneMocksIfc<IncludeDamp>;
}
