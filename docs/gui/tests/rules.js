describe("DistortionsRules", function() {
  "use strict";
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
  
  function getCheckbox(group, name) {
    const inputs = rules.groupToInputsMap.get(group);
    return inputs.find((i) => i.dataset.name == name);
  }

  function testCheckboxState(checkbox, condition) {
    expect(condition()).toBe(checkbox.checked);
    if (checkbox.disabled)
      return;
    checkbox.click();
    expect(condition()).toBe(checkbox.checked);
    checkbox.click();
    expect(condition()).toBe(checkbox.checked);
  }

  function testValue(value, expectedKeys) {
    const isFunction = typeof value === "function";
    rules = window.setupRules(value);

    // Initial value setup.
    expect(rules.value).toBe(value);
    expect(rules.groupToInputsMap.size).toBe(3);

    // HTML form controls, initial states.
    const filterKeysCheckbox = window.document.getElementsByClassName("filterOwnKeys-control")[0];
    isCheckboxWithName(filterKeysCheckbox, "filterOwnKeys", true);

    let truncateArgButton, truncateArgMax;
    {
      const path = '//button[@data-name="truncateArgList"]';
      const result = window.document.evaluate(
        path, window.document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
      );
      truncateArgButton = result.singleNodeValue;
      truncateArgMax = truncateArgButton.nextElementSibling;
    }
    expect(truncateArgButton instanceof window.HTMLButtonElement).toBe(true);
    expect(truncateArgButton.value).toBe("false");
    expect(truncateArgButton.disabled).toBe(!isFunction);

    expect(truncateArgMax instanceof window.HTMLInputElement).toBe(true);
    expect(truncateArgMax.disabled).toBe(true);
    expect(truncateArgMax.value).toBe("0");

    // Own keys, initial states.
    {
      let items = rules.groupToInputsMap.get("ownKeys");
      expect(Array.isArray(items)).toBe(true);
      expectedKeys.forEach(function(key, index) {
        isCheckboxWithName(items[index], key, true);
      });
      expect(items.length).toBe(expectedKeys.length);
    }

    // Proxy traps, initial states.
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

    // Standard membrane distortions, initial states.
    {
      let items = rules.groupToInputsMap.get("distortions");
      expect(Array.isArray(items)).toBe(true);
      isCheckboxWithName(items[0],  "inheritFilter", true);
      isCheckboxWithName(items[1],  "storeUnknownAsLocal", true);
      isCheckboxWithName(items[2],  "requireLocalDelete", true);
      // skipping truncateArgButton, truncateArgMax
      isCheckboxWithName(items[5],  "useShadowTarget", false);
      expect(items.length).toBe(6);
    }

    // Configuration dynamic properties.
    {
      let config = rules.configurationAsJSON();
      delete config.formatVersion;
      delete config.dataVersion;

      expect(config.filterOwnKeys).toEqual(expectedKeys);
      expect(config.inheritFilter).toBe(true);
      expect(config.storeUnknownAsLocal).toBe(true);
      expect(config.requireLocalDelete).toBe(true);
      expect(config.useShadowTarget).toBe(false);
      if (isFunction)
        expect(config.truncateArgList).toBe(false);
      else
        expect("truncateArgList" in config).toBe(false);
    }

    // Configuration update tests
    testCheckboxState(
      filterKeysCheckbox,
      () => Array.isArray(rules.configurationAsJSON().filterOwnKeys)
    );

    expectedKeys.forEach(function(key) {
      const checkbox = getCheckbox("ownKeys", key);
      expect(checkbox).not.toBe(null);
      if (!checkbox)
        return;
      testCheckboxState(
        checkbox, () => rules.configurationAsJSON().filterOwnKeys.includes(key)
      );
    });

    [
      "getPrototypeOf",
      "setPrototypeOf",
      "isExtensible",
      "preventExtensions",
      "getOwnPropertyDescriptor",
      "defineProperty",
      "has",
      "get",
      "set",
      "deleteProperty",
      "ownKeys",
      "apply",
      "construct"
    ].forEach(function(key) {
      const checkbox = getCheckbox("traps", key);
      testCheckboxState(
        checkbox, () => rules.configurationAsJSON().proxyTraps.includes(key)
      );
    });

    [
      "inheritFilter",
      "storeUnknownAsLocal",
      "requireLocalDelete",
      "useShadowTarget"
    ].forEach(function(key) {
      const checkbox = getCheckbox("distortions", key);
      expect(checkbox).not.toBe(undefined);
      if (!checkbox)
        return;
      testCheckboxState(checkbox, () => rules.configurationAsJSON()[key]);
    });

    if (isFunction) {
      for (let i = 0; i < 2; i++) {
        expect(rules.configurationAsJSON().truncateArgList).toBe(false);
        truncateArgButton.click();
        expect(rules.configurationAsJSON().truncateArgList).toBe(true);
        truncateArgButton.click();
        expect(rules.configurationAsJSON().truncateArgList).toBe(i);
        truncateArgMax.stepUp();
        expect(rules.configurationAsJSON().truncateArgList).toBe(i + 1);
        truncateArgButton.click();
      }
    }
  }

  describe(".validateConfiguration with", function() {
    let valid;
    beforeEach(function() {
      valid = {
        "formatVersion": "0.8.2",
        "dataVersion": "0.1",
        "filterOwnKeys": [
          "shape",
          "color"
        ],
        "proxyTraps": [
          "getPrototypeOf",
          "setPrototypeOf",
          "isExtensible",
          "preventExtensions",
          "getOwnPropertyDescriptor",
          "defineProperty",
          "has",
          "get",
          "set",
          "deleteProperty",
          "ownKeys",
          "apply",
          "construct"
        ],
        "inheritFilter": true,
        "storeUnknownAsLocal": true,
        "requireLocalDelete": true,
        "useShadowTarget": false,
        "truncateArgList": false
      };
    });

    function runTestForFailure(errMessage) {
      let pass = false, exn = null;
      try {
        window.DistortionsRules.validateConfiguration(valid);
      }
      catch (e) {
        pass = true;
        exn = e;
      }

      expect(exn).toBe(errMessage);
    }

    function runTestForValidity() {
      window.DistortionsRules.validateConfiguration(valid);
    }

    it("a normal configuration", runTestForValidity);

    it("formatVersion missing", function() {
      delete valid.formatVersion;
      runTestForFailure("formatVersion must be of type string");
    });

    it("formatVersion not a version number", function() {
      valid.formatVersion = "foo";
      runTestForFailure(
        "formatVersion must be a normal semantic versioning number"
      );
    });

    it("formatVersion a two-part version number", function() {
      valid.formatVersion = "1.0";
      runTestForValidity();
    });

    it("formatVersion a three-part version number", function() {
      valid.formatVersion = "1.0.1";
      runTestForValidity();
    });

    it("dataVersion missing", function() {
      delete valid.dataVersion;
      runTestForFailure("dataVersion must be of type string");
    });

    it("dataVersion not a version number", function() {
      valid.dataVersion = "foo";
      runTestForFailure(
        "dataVersion must be a normal semantic versioning number"
      );
    });

    it("dataVersion a two-part version number", function() {
      valid.dataVersion = "1.0";
      runTestForValidity();
    });

    it("dataVersion a three-part version number", function() {
      valid.dataVersion = "1.0.1";
      runTestForValidity();
    });

    it("filterOwnKeys missing", function() {
      delete valid.filterOwnKeys;
      runTestForFailure(
        "filterOwnKeys must be null or an array of unique strings and symbols (absent)"
      );
    });

    it("filterOwnKeys neither an array nor null", function() {
      valid.filterOwnKeys = 0;
      runTestForFailure(
        "filterOwnKeys must be null or an array of unique strings and symbols (not an array)"
      );
    });

    it("filterOwnKeys null", function() {
      valid.filterOwnKeys = null;
      runTestForValidity();
    });

    it("filterOwnKeys an array containing a boolean member", function() {
      valid.filterOwnKeys = ["foo", "bar", true];
      runTestForFailure(
        "filterOwnKeys must be null or an array of unique strings and symbols (not a string or symbol: true)"
      );
    });

    it("filterOwnKeys an array containing a Symbol", function() {
      valid.filterOwnKeys = ["foo", "bar", Symbol("baz")];
      runTestForValidity();
    });

    it("proxyTraps missing", function() {
      delete valid.proxyTraps;
      runTestForFailure("config.proxyTraps is not an array");
    });

    it("proxyTraps as a number", function() {
      valid.proxyTraps = 2;
      runTestForFailure("config.proxyTraps is not an array");
    });

    it("proxyTraps as an empty array", function() {
      valid.proxyTraps = [];
      runTestForValidity();
    });

    it("proxyTraps missing a few items", function() {
      valid.proxyTraps.splice(3, 3);
      runTestForValidity();
    });

    it("proxyTraps having a few items out of order", function() {
      // technically this shouldn't happen but it is valid
      let extract = valid.proxyTraps.splice(3, 3);
      valid.proxyTraps = valid.proxyTraps.concat(extract);
      runTestForValidity();
    });

    it("proxyTraps having an unexpected value", function() {
      valid.proxyTraps.splice(3, 0, "extra");
      runTestForFailure("config.proxyTraps has an unexpected value: extra");
    });

    it("proxyTraps having a duplicate value", function() {
      valid.proxyTraps.splice(3, 0, "ownKeys");
      runTestForFailure("config.proxyTraps has a duplicate string: ownKeys");
    });

    [
      "inheritFilter",
      "storeUnknownAsLocal",
      "requireLocalDelete",
      "useShadowTarget",
    ].forEach(function(mod) {
      it(`${mod} missing`, function() {
        delete valid[mod];
        runTestForFailure(`${mod} must be of type boolean`);
      });

      it(`${mod} being a string`, function() {
        valid[mod] = "foo";
        runTestForFailure(`${mod} must be of type boolean`);
      });
    });

    it("truncateArgList missing", function() {
      delete valid.truncateArgList;
      runTestForFailure(
        "truncateArgList must be a boolean or a non-negative integer"
      );
    });

    it("truncateArgList being a string", function() {
      valid.truncateArgList = "foo";
      runTestForFailure(
        "truncateArgList must be a boolean or a non-negative integer"
      );
    });

    it("truncateArgList being null", function() {
      valid.truncateArgList = null;
      runTestForFailure(
        "truncateArgList must be a boolean or a non-negative integer"
      );
    });

    it("truncateArgList being a negative number", function() {
      valid.truncateArgList = -1;
      runTestForFailure(
        "truncateArgList must be a boolean or a non-negative integer"
      );
    });

    it("truncateArgList being NaN", function() {
      valid.truncateArgList = NaN;
      runTestForFailure(
        "truncateArgList must be a boolean or a non-negative integer"
      );
    });

    it("truncateArgList being Infinity", function() {
      valid.truncateArgList = Infinity;
      runTestForFailure(
        "truncateArgList must be a boolean or a non-negative integer"
      );
    });

    it("truncateArgList being a decimal", function() {
      valid.truncateArgList = 0.5;
      runTestForFailure(
        "truncateArgList must be a boolean or a non-negative integer"
      );
    });

    it("truncateArgList being true", function() {
      valid.truncateArgList = true;
      runTestForValidity();
    });

    it("truncateArgList being false", function() {
      valid.truncateArgList = false;
      runTestForValidity();
    });

    it("truncateArgList being 0", function() {
      valid.truncateArgList = 0;
      runTestForValidity();
    });

    it("truncateArgList being 1", function() {
      valid.truncateArgList = 1;
      runTestForValidity();
    });

    it("truncateArgList being 100", function() {
      valid.truncateArgList = 100;
      runTestForValidity();
    });
  });

  describe("GUI", function() {
    it("can fully initialize with an object", function() {
      let ctor = window.DecrementCounter;
      let counter = new ctor();
      testValue(counter, ["value"]);
    });

    it("can fully initialize with a function", function() {
      testValue(window.DecrementCounter, [
        "arguments", "caller", "length", "name", "prototype"
      ]);
    });

    it("can fully initialize with a function having extra properties", function() {
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
});
