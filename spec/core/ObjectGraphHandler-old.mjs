import ObjectGraphHandler from "../../source/core/ObjectGraphHandler-old.mjs";

xdescribe("Legacy ObjectGraphHandler", () => {
  let handler, membrane;

  beforeEach(() => {
    membrane = {};
    handler = new ObjectGraphHandler(membrane, "wet");
    void(handler);
  });

  it("works", () => {
    fail("unit tests not in place yet");
  });
});
