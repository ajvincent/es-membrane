"use strict";
it("Reflect Proxy objects correctly implement instanceof", function() {
  function a() {}
  const {proxy, revoke} = Proxy.revocable(a, Reflect);
  const A = proxy;

  const b = new a();
  expect(b instanceof a).toBe(true);
  expect(b instanceof A).toBe(true);

  const B = new A();
  expect(B instanceof a).toBe(true);
  expect(B instanceof A).toBe(true);
});
