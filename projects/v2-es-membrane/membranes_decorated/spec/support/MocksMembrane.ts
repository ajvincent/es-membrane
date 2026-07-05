import {
  AbstractClass,
  Class
} from "type-fest";

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
  MockNodeIfc,
  MockDocumentIfc,
  MockElementIfc
} from "../../fixtures/mock-dom/types/MockDOMInterfaces.js";

export interface MembraneMocksIfc<IncludeDamp extends boolean> {
  readonly membrane: MembraneIfc;
  readonly wetDocument: MockDocumentIfc;
  readonly NodeWet: AbstractClass<MockNodeIfc, [MockDocumentIfc]>;
  readonly ElementWet: Class<MockElementIfc, [MockDocumentIfc, string]>;
  readonly dryDocument: MockDocumentIfc;
  readonly NodeDry: AbstractClass<MockNodeIfc, [MockDocumentIfc]>;
  readonly ElementDry: Class<MockElementIfc, [MockDocumentIfc, string]>;
  readonly dampDocument: IncludeDamp extends true ? MockDocumentIfc : undefined;
  readonly NodeDamp: IncludeDamp extends true ? AbstractClass<MockNodeIfc, [MockDocumentIfc]> : undefined;
  readonly ElementDamp: IncludeDamp extends true ? Class<MockElementIfc, [MockDocumentIfc, string]> : undefined;
}

export async function MocksMembrane<IncludeDamp extends boolean>(
  enabledDecorators: ReadonlySet<string>,
  includeDamp: IncludeDamp
): Promise<MembraneMocksIfc<IncludeDamp>>
{
  const {
    wetDocument,
    NodeWet,
    ElementWet
  }: WetDOMMocksIfc = await WetDOMMocks(enabledDecorators);
  const membrane: MembraneIfc = new Membrane();
  membrane.createObjectGraph("wet");
  membrane.createObjectGraph("dry");

  const dryDocument: MockDocumentIfc = membrane.convertObject("wet", "dry", wetDocument);
  // needed to test constructors
  const NodeDry: AbstractClass<MockNodeIfc, [MockDocumentIfc]> = membrane.convertObject("wet", "dry", NodeWet);
  const ElementDry: Class<MockElementIfc, [MockDocumentIfc, string]> = membrane.convertObject("wet", "dry", ElementWet);

  if (!includeDamp) {
    return {
      membrane,
      wetDocument,
      NodeWet,
      ElementWet,
      dryDocument,
      NodeDry,
      ElementDry,
      dampDocument: undefined,
      NodeDamp: undefined,
      ElementDamp: undefined,
    } as MembraneMocksIfc<IncludeDamp>;
  }

  membrane.createObjectGraph("damp");
  const dampDocument: MockDocumentIfc = membrane.convertObject("wet", "damp", wetDocument);
  const NodeDamp: AbstractClass<MockNodeIfc, [MockDocumentIfc]> = membrane.convertObject("wet", "damp", NodeWet);
  const ElementDamp: Class<MockElementIfc, [MockDocumentIfc, string]> = membrane.convertObject("wet", "damp", ElementWet);

  return {
    membrane,
    wetDocument,
    NodeWet,
    ElementWet,
    dryDocument,
    NodeDry,
    ElementDry,
    dampDocument,
    NodeDamp,
    ElementDamp,
  } as MembraneMocksIfc<IncludeDamp>;
}
