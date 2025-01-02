import ArrayNotImplementedCanary from "#stage_two/snapshot/source/array-utilities/ArrayNotImplementedCanary.js";

it("ArrayNotImplementedCanary covers all members of `readonly object[]`", () => {
  expect(ArrayNotImplementedCanary).toBeTruthy();
});
