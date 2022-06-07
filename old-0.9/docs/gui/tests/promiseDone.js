it("Jasmine allows using a Promise to load a specific webpage test", async function() {
  let document = await getDocumentLoadPromise("base/gui/tests/promiseDone.html");
  expect(document.getElementById("foo")).toBe(document.body);
});
