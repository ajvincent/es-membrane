import {
  expectValueDescriptor,
  expectInstanceDescriptor,
} from "../helpers/expectDataDescriptor.mjs";

class Foo {}

it("expectValueDescriptor works", () => {
  const desc = {
    value: Foo,
    writable: true,
    enumerable: true,
    configurable: false
  };

  expectValueDescriptor(Foo, true, true, false, desc);
});

it("expectInstanceDescriptor works", () => {
  const desc = {
    value: new Foo,
    writable: true,
    enumerable: true,
    configurable: false
  };

  expectInstanceDescriptor(Foo, true, true, false, desc);
});
