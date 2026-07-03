import {
  MembraneIfc
} from "../source/types/MembraneIfc.js";

import {
  MockDocumentIfc
} from "../fixtures/mock-dom/types/MockDOMInterfaces.js";

import {
  MocksMembrane
} from "./support/MocksMembrane.js";

describe("basic concepts: ", () => {
  let wetDocument: MockDocumentIfc, dryDocument: MockDocumentIfc, membrane: MembraneIfc;
  beforeEach(() => {
    const parts = MocksMembrane(new Set(), false);
    wetDocument = parts.wetDocument;
    dryDocument = parts.dryDocument;
    membrane = parts.membrane;
  });

  afterEach(() => {
    membrane.revokeEverything();
  });

  it("dryDocument and wetDocument should not be the same", () => {
    expect(dryDocument === wetDocument).toBe(false);
  });

  it("Looking up a primitive on a directly defined value works", ()=> {
    expect(dryDocument.nodeType).toBe(9);
  });
});
