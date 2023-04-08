import DerivedFixtureClass from "../fixtures/DecoratedClass/DerivedClass.mjs";

it("We can get a decorated class with derived types (including static fields)", () => {
  const derivedObject = new DerivedFixtureClass(4);

  // base instance properties
  expect(derivedObject.p).toBe(3);
  expect(derivedObject.x).toBe(4);

  // derived instance properties
  expect(derivedObject.z).toBe(7);

  // base class properties
  expect(DerivedFixtureClass.y()).toBe(5);

  // derived class properties
  expect(DerivedFixtureClass.foo).toBe("hi");
});
