it("Jasmine allows using a Promise to load a specific webpage test", function(done) {
  getDocumentLoadPromise("gui/tests/promiseDone.html").then(
    function(document) {
      expect(document.getElementById("foo")).toBe(document.body);
    }
  ).then(done);
});
