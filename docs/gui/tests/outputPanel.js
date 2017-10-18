describe("Output panel", function() {
  var window;
  beforeEach(function() {
    window = testFrame.contentWindow;
    window.StartPanel.testMode = true;
  });

  /* We could check the contents of the CodeMirror instance... but
   * that's much less important than the download link working.
   */
  describe("in the configuration file link", function() {
    it("consistently matches the HandlerNames", async function() {
      await getGUIMocksPromise([]);
      let url, actualJSON;

      {
        url = window.OutputPanel.configLink.getAttribute("href");
        actualJSON = JSON.parse(await XHRPromise(url));
        expect(actualJSON.graphNames).toEqual(["wet", "dry"]);
        expect(actualJSON.graphSymbolLists).toEqual([]);
      }


      // Tinkering around with HandlerNames, even though the user can't:
      // this is for consistency
      window.HandlerNames.setRow(2, "damp", true);
      window.OutputPanel.update();

      {
        url = window.OutputPanel.configLink.getAttribute("href");
        actualJSON = JSON.parse(await XHRPromise(url));
        expect(actualJSON.graphNames).toEqual(["wet", "dry", "damp"]);
        expect(actualJSON.graphSymbolLists).toEqual([2]);
      }

      // XXX ajvincent Checking for files depends on issues #121, 122.
    });
  });
});
