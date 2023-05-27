import { DataDescriptor, AccessorDescriptor } from "../../source/publicUtilities.mjs";

it("Instances of DataDescriptor are PropertyDescriptors", () => {
  const desc: PropertyDescriptor = new DataDescriptor<true>(true, false);
  expect(desc).toBeTruthy();
});

it("Instances of AccessorDescriptor are PropertyDescriptors", () => {
  const desc: PropertyDescriptor = new AccessorDescriptor<boolean>(
    () => true,
    (value) => void(value)
  );
  expect(desc).toBeTruthy();
});
