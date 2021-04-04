export function expectValueDescriptor(value, writable, enumerable, configurable, desc) {
  expect(desc.value === value).toBe(true, "descriptor value must match");
  expect(desc.writable).toBe(writable, "descriptor writable must match");
  expect(desc.enumerable).toBe(enumerable, "descriptor enumerable must match");
  expect(desc.configurable).toBe(configurable, "descriptor configurable must match");
}

export function expectInstanceDescriptor(type, writable, enumerable, configurable, desc) {
  expect(desc.value instanceof type).toBe(true, "descriptor value must be an instance of the given type");
  expect(desc.writable).toBe(writable, "descriptor writable must match");
  expect(desc.enumerable).toBe(enumerable, "descriptor enumerable must match");
  expect(desc.configurable).toBe(configurable, "descriptor configurable must match");
}
