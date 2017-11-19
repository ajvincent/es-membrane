describe("BlobLoader", function() {
  "use strict";
  var window;
  beforeEach(async function() {
    await getDocumentLoadPromise("base/gui/blob/BlobLoader.html");
    window = testFrame.contentWindow;
  });

  function invertPromise(callback) {
    let p = callback();
    p = p.then(
      function(value = "Expected error, but none was thrown") {
        throw value;
      },
      function(value) {
        return value;
      });
    return p;
  }
  
  function getBlobURL(source) {
    let blob = new Blob([source], { type: "application/javascript" });
    return URL.createObjectURL(blob);
  }

  describe(".addCommonURL", function() {
    it("throws for a non-string argument 0", async function() {
      let err = await invertPromise(async function() {
        return window.BlobLoader.addCommonURL(false);
      });
      expect(err.message).toBe("url must be a string starting with a protocol");
    });

    it("does not throw for an empty string", async function() {
      await window.BlobLoader.addCommonURL(getBlobURL(""));
    });

    it(
      "allows defining a variable that another script can call on",
      async function() {
        await window.BlobLoader.addCommonURL(getBlobURL("var x = 1;"));
        await window.BlobLoader.addCommonURL(getBlobURL("x += 1;"));
        await window.BlobLoader.addCommonURL(getBlobURL("window.x = x;"));
        expect(window.x).toBe(2);
      }
    );

    it("throws for a syntax error", async function() {
      let err = await invertPromise(function() {
        return window.BlobLoader.addCommonURL(getBlobURL(`var x = {`));
      });
      expect(err.message.startsWith("SyntaxError:"));
    });

    it("throws for an explicitly thrown error", async function() {
      let err = await invertPromise(function() {
        return window.BlobLoader.addCommonURL(
          getBlobURL(`throw new Error("intentional error");`)
        );
      });
      expect(err.message).toBe("intentional error");
    });
  });

  describe(".addNamedValue", function() {
    const validSource = "function() { return 1; }";
    it("throws for a non-string argument 0", async function() {
      let err = await invertPromise(async function() {
        return window.BlobLoader.addNamedValue(false, validSource);
      });
      expect(err.message).toBe("name must be a string");
    });

    it("works with a valid name and source", async function() {
      await window.BlobLoader.addNamedValue("one", validSource);
      expect(window.BlobLoader.valuesByName.get("one")).toBe(1);
    });

    it("throws for a known name", async function() {
      await window.BlobLoader.addNamedValue("one", validSource);
      let err = await invertPromise(async function() {
        return window.BlobLoader.addNamedValue("one", validSource);
      });
      expect(err.message).toBe("BlobLoader.valuesByName already has a named value one");
    });

    it("throws for a non-function source", async function() {
      let err = await invertPromise(async function() {
        return window.BlobLoader.addNamedValue("one", "foo");
      });
      expect(err.message).toBe("fnSource must define a function");
    });

    it("throws for a syntax error", async function() {
      let err = await invertPromise(async function() {
        return window.BlobLoader.addNamedValue("one", `function() { var x = {}`);
      });
      expect(err.message.startsWith("SyntaxError:"));
    });

    it("throws for an explicitly thrown error", async function() {
      let err = await invertPromise(async function() {
        return window.BlobLoader.addNamedValue("three", `function() {
          throw new Error("intentional error");
        }`);
      });
      expect(err.message).toBe("intentional error");
    });

    it("can reference a common source file", async function() {
      await window.BlobLoader.addCommonURL(getBlobURL("var x = 1;"));
      await window.BlobLoader.addNamedValue(
        "two", `function() { return x + 1; }`
      );
      expect(window.BlobLoader.valuesByName.get("two")).toBe(2);
    });

    it("can reference another defined value", async function() {
      await window.BlobLoader.addNamedValue("one", validSource);
      await window.BlobLoader.addNamedValue(
        "two", "function() { return BlobLoader.valuesByName.get('one') + 1; }"
      );
      expect(window.BlobLoader.valuesByName.get("two")).toBe(2);
    });
  });
});
