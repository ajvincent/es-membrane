export function expectValueDescriptor(value, writable, enumerable, configurable, desc) {
  expect(desc).toEqual({
    value,
    writable,
    enumerable,
    configurable
  });
}

export function expectInstanceDescriptor(type, writable, enumerable, configurable, desc) {
  expect(desc.value instanceof type).toBe(true);
  expect(desc.writable).toBe(writable);
  expect(desc.enumerable).toBe(enumerable);
  expect(desc.configurable).toBe(configurable);
}
