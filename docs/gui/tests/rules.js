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


  function isCheckboxWithName(item, expectedName, expectedChecked, expectedDisabled = false) {
    expect(item instanceof window.HTMLInputElement).toBe(true);
    expect(item.dataset.name).toBe(expectedName);
    if (item.type === "checkbox")
      expect(item.checked).toBe(expectedChecked);
    expect(item.disabled).toBe(expectedDisabled);
  }

  function testValue(value, expectedKeys) {
    const isFunction = typeof value === "function";
    const rules = window.setupRules(value);
    expect(rules.value).toBe(value);
    expect(rules.groupToInputsMap.size).toBe(3);

    {
      let items = rules.groupToInputsMap.get("ownKeys");
      expect(Array.isArray(items)).toBe(true);
      expectedKeys.forEach(function(key, index) {
        isCheckboxWithName(items[index], key, true);
      });
      expect(items.length).toBe(expectedKeys.length);
    }

    {
      let items = rules.groupToInputsMap.get("traps");
      expect(Array.isArray(items)).toBe(true);
      isCheckboxWithName(items[0],  "getPrototypeOf", true);
      isCheckboxWithName(items[1],  "setPrototypeOf", false);
      isCheckboxWithName(items[2],  "isExtensible", true);
      isCheckboxWithName(items[3],  "preventExtensions", true);
      isCheckboxWithName(items[4],  "getOwnPropertyDescriptor", true);
      isCheckboxWithName(items[5],  "defineProperty", true);
      isCheckboxWithName(items[6],  "has", true);
      isCheckboxWithName(items[7],  "get", true);
      isCheckboxWithName(items[8],  "set", true);
      isCheckboxWithName(items[9],  "deleteProperty", true);
      isCheckboxWithName(items[10], "ownKeys", true);
      isCheckboxWithName(items[11], "apply", true, !isFunction);
      isCheckboxWithName(items[12], "construct", true, !isFunction);
      expect(items.length).toBe(13);
    }

    {
      let items = rules.groupToInputsMap.get("distortions");
      expect(Array.isArray(items)).toBe(true);
      isCheckboxWithName(items[0],  "storeUnknownAsLocal", true);
      isCheckboxWithName(items[1],  "requireLocalDelete", true);
      expect(items[2] instanceof window.HTMLButtonElement).toBe(true);
      expect(items[2].dataset.name).toBe("truncateArgList");
      expect(items[2].value).toBe("false");
      expect(items[2].disabled).toBe(!isFunction);
      isCheckboxWithName(items[3],  "truncateArgMax", true, true);
      isCheckboxWithName(items[4],  "useShadowTarget", false);
      expect(items.length).toBe(5);
    }

    {
      let config = rules.configurationAsJSON();
      delete config.formatVersion;
      delete config.dataVersion;

      expect(config.filterOwnKeys).toEqual(expectedKeys);
      expect(typeof config.truncateArgList).toBe(isFunction ? "boolean" : "undefined");
      if (isFunction)
        expect(config.truncateArgList).toBe(false);
    }
  }

  it("can fully initialize with an object", function() {
    let ctor = window.DecrementCounter;
    let counter = new ctor();
    testValue(counter, ["value"]);
  });

  it("can fully initialize with a function having no extra properties", function() {
    testValue(window.DecrementCounter, [
      "arguments", "caller", "length", "name", "prototype"
    ]);
  });

  it("can fully initialize with a function having no extra properties", function() {
    let k = function() {};
    k.foo = 3;
    k.bar = 6;
    testValue(k, [
      "arguments", "caller", "length", "name", "prototype", "foo", "bar"
    ]);
  });

  it("can fully initialize with a function's prototype", function() {
    testValue(window.DecrementCounter.prototype, [
      "value", "subtractOne"
    ]);
  });
});
