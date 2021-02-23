import ObjectGraphHandler from "../../source/core/ObjectGraphHandler-old.mjs";

describe("Legacy ObjectGraphHandler", () => {
  let handler, membrane;

  beforeEach(() => {
    membrane = {};
    handler = new ObjectGraphHandler(membrane, "wet");
  });

  xit("exists", () => {
    expect(handler).toBeTruthy();
  });
});
