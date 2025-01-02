import ArrayNotImplementedCanary from "#stage_one/prototype-snapshot/array-utilities/ArrayNotImplementedCanary.js";

it("ArrayNotImplementedCanary covers all members of `readonly object[]`", () => {
  expect(ArrayNotImplementedCanary).toBeTruthy();
});
