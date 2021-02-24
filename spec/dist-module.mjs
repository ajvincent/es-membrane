import Membrane from "../docs/dist/Membrane.mjs";

it("Membrane exists in a distributable module", () => {
  expect(typeof Membrane).toBe("function");
});
