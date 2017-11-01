describe("DistortionsRules", function() {
  {
    let pass = false;
    try {
      if (Boolean(CSS) && (typeof CSS.supports === "function")) 
        pass = CSS.supports("display", "grid");
    }
    catch (e) {
      // do nothing
    }
    if (!pass)
      return;
  }

  var window, rules;
  beforeEach(async function() {
    await getDocumentLoadPromise("base/gui/tests/rules-fixture.html");
    window = testFrame.contentWindow;
  });

  afterEach(function() {
    window = null;
    rules = null;
  });

  it("can fully initialize", function() {
    let ctor = window.DecrementCounter;
    let value = new ctor();
    const rules = window.setupRules(value);
    expect(rules.value).toBe(value);
  });
});
