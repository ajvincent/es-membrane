import {
  Membrane
} from "#membranes_decorated/source/Membrane.js";

describe("Membrane", () => {
  xit("is not ready to go", () => {
    void(Membrane);
    expect(true).toBe(false);
  });
});
