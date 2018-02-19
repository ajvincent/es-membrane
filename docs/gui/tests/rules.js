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

  var window, rules, testConfig;
  beforeEach(async function() {
    await getDocumentLoadPromise("base/gui/tests/rules-fixture.html");
    window = testFrame.contentWindow;
  });

  afterEach(function() {
    window = null;
    rules = null;
    testConfig = null;
  });

  function isCheckboxWithName(
    item, expectedName, expectedChecked, expectedDisabled = false
  )
  {
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
      isCheckboxWithName(items[3],  "preventExtensions", false);
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
      let config = rules.exportJSON();
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
      () => Array.isArray(rules.exportJSON().filterOwnKeys)
    );

    expectedKeys.forEach(function(key) {
      const checkbox = getCheckbox("ownKeys", key);
      expect(checkbox).not.toBe(null);
      if (!checkbox)
        return;
      testCheckboxState(
        checkbox, () => rules.exportJSON().filterOwnKeys.includes(key)
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
        checkbox, () => rules.exportJSON().proxyTraps.includes(key)
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
      testCheckboxState(checkbox, () => rules.exportJSON()[key]);
    });

    if (isFunction) {
      for (let i = 0; i < 2; i++) {
        expect(rules.exportJSON().truncateArgList).toBe(false);
        truncateArgButton.click();
        expect(rules.exportJSON().truncateArgList).toBe(true);
        truncateArgButton.click();
        expect(rules.exportJSON().truncateArgList).toBe(i);
        truncateArgMax.stepUp();
        expect(rules.exportJSON().truncateArgList).toBe(i + 1);
        truncateArgButton.click();
      }
    }

    expect("groupDistortions" in rules.exportJSON()).toBe(false);
  }

  function setTestConfig() {
    testConfig = {
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
  }

  describe(".validateConfiguration with", function() {
    beforeEach(setTestConfig);

    function runTestForFailure(errMessage) {
      let pass = false, exn = null;
      try {
        window.DistortionsRules.validateConfiguration(testConfig);
      }
      catch (e) {
        pass = true;
        exn = e;
      }

      expect(exn).toBe(errMessage);
    }

    function runTestForValidity() {
      window.DistortionsRules.validateConfiguration(testConfig);
    }

    it("a normal configuration", runTestForValidity);

    it("formatVersion missing", function() {
      delete testConfig.formatVersion;
      runTestForFailure("formatVersion must be of type string");
    });

    it("formatVersion not a version number", function() {
      testConfig.formatVersion = "foo";
      runTestForFailure(
        "formatVersion must be a normal semantic versioning number"
      );
    });

    it("formatVersion a two-part version number", function() {
      testConfig.formatVersion = "1.0";
      runTestForValidity();
    });

    it("formatVersion a three-part version number", function() {
      testConfig.formatVersion = "1.0.1";
      runTestForValidity();
    });

    it("dataVersion missing", function() {
      delete testConfig.dataVersion;
      runTestForFailure("dataVersion must be of type string");
    });

    it("dataVersion not a version number", function() {
      testConfig.dataVersion = "foo";
      runTestForFailure(
        "dataVersion must be a normal semantic versioning number"
      );
    });

    it("dataVersion a two-part version number", function() {
      testConfig.dataVersion = "1.0";
      runTestForValidity();
    });

    it("dataVersion a three-part version number", function() {
      testConfig.dataVersion = "1.0.1";
      runTestForValidity();
    });

    it("filterOwnKeys missing", function() {
      delete testConfig.filterOwnKeys;
      runTestForFailure(
        "filterOwnKeys must be null or an array of unique strings and symbols (absent)"
      );
    });

    it("filterOwnKeys neither an array nor null", function() {
      testConfig.filterOwnKeys = 0;
      runTestForFailure(
        "filterOwnKeys must be null or an array of unique strings and symbols (not an array)"
      );
    });

    it("filterOwnKeys null", function() {
      testConfig.filterOwnKeys = null;
      runTestForValidity();
    });

    it("filterOwnKeys an array containing a boolean member", function() {
      testConfig.filterOwnKeys = ["foo", "bar", true];
      runTestForFailure(
        "filterOwnKeys must be null or an array of unique strings and symbols (not a string or symbol: true)"
      );
    });

    it("filterOwnKeys an array containing a Symbol", function() {
      testConfig.filterOwnKeys = ["foo", "bar", Symbol("baz")];
      runTestForValidity();
    });

    it("proxyTraps missing", function() {
      delete testConfig.proxyTraps;
      runTestForFailure("config.proxyTraps is not an array");
    });

    it("proxyTraps as a number", function() {
      testConfig.proxyTraps = 2;
      runTestForFailure("config.proxyTraps is not an array");
    });

    it("proxyTraps as an empty array", function() {
      testConfig.proxyTraps = [];
      runTestForValidity();
    });

    it("proxyTraps missing a few items", function() {
      testConfig.proxyTraps.splice(3, 3);
      runTestForValidity();
    });

    it("proxyTraps having a few items out of order", function() {
      // technically this shouldn't happen but it is valid
      let extract = testConfig.proxyTraps.splice(3, 3);
      testConfig.proxyTraps = testConfig.proxyTraps.concat(extract);
      runTestForValidity();
    });

    it("proxyTraps having an unexpected value", function() {
      testConfig.proxyTraps.splice(3, 0, "extra");
      runTestForFailure("config.proxyTraps has an unexpected value: extra");
    });

    it("proxyTraps having a duplicate value", function() {
      testConfig.proxyTraps.splice(3, 0, "ownKeys");
      runTestForFailure("config.proxyTraps has a duplicate string: ownKeys");
    });

    [
      "inheritFilter",
      "storeUnknownAsLocal",
      "requireLocalDelete",
      "useShadowTarget",
    ].forEach(function(mod) {
      it(`${mod} missing`, function() {
        delete testConfig[mod];
        runTestForFailure(`${mod} must be of type boolean`);
      });

      it(`${mod} being a string`, function() {
        testConfig[mod] = "foo";
        runTestForFailure(`${mod} must be of type boolean`);
      });
    });

    it("truncateArgList missing", function() {
      delete testConfig.truncateArgList;
      runTestForFailure(
        "truncateArgList must be a boolean or a non-negative integer"
      );
    });

    it("truncateArgList being a string", function() {
      testConfig.truncateArgList = "foo";
      runTestForFailure(
        "truncateArgList must be a boolean or a non-negative integer"
      );
    });

    it("truncateArgList being null", function() {
      testConfig.truncateArgList = null;
      runTestForFailure(
        "truncateArgList must be a boolean or a non-negative integer"
      );
    });

    it("truncateArgList being a negative number", function() {
      testConfig.truncateArgList = -1;
      runTestForFailure(
        "truncateArgList must be a boolean or a non-negative integer"
      );
    });

    it("truncateArgList being NaN", function() {
      testConfig.truncateArgList = NaN;
      runTestForFailure(
        "truncateArgList must be a boolean or a non-negative integer"
      );
    });

    it("truncateArgList being Infinity", function() {
      testConfig.truncateArgList = Infinity;
      runTestForFailure(
        "truncateArgList must be a boolean or a non-negative integer"
      );
    });

    it("truncateArgList being a decimal", function() {
      testConfig.truncateArgList = 0.5;
      runTestForFailure(
        "truncateArgList must be a boolean or a non-negative integer"
      );
    });

    it("truncateArgList being true", function() {
      testConfig.truncateArgList = true;
      runTestForValidity();
    });

    it("truncateArgList being false", function() {
      testConfig.truncateArgList = false;
      runTestForValidity();
    });

    it("truncateArgList being 0", function() {
      testConfig.truncateArgList = 0;
      runTestForValidity();
    });

    it("truncateArgList being 1", function() {
      testConfig.truncateArgList = 1;
      runTestForValidity();
    });

    it("truncateArgList being 100", function() {
      testConfig.truncateArgList = 100;
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

    // Yes, magic numbers suck.  Deal with it.
    const groupCol = 3;

    function setSecondaryDistortion(row, dName) {
      const dialog = window.document.getElementById("distortions-groups-dialog");
      const input = window.document.getElementById("distortions-groups-input");

      const propName = rules.gridtree.getCell(row, 0).firstChild.nodeValue;
      const button = rules.gridtree.getCell(row, groupCol).firstElementChild;

      expect(button.nodeName.toLowerCase()).toBe("button");
      expect(button.classList.contains("distortions-group")).toBe(true);

      const current = (button.firstChild) ? button.firstChild.nodeValue : "";

      button.click();
      expect(dialog.classList.contains("visible")).toBe(true);
      expect(input.value).toBe(current);

      let event = new KeyboardEvent("keyup", {
        key: "Escape"
      });
      input.dispatchEvent(event);
      button.focus();
      expect(button.firstChild.nodeValue).toBe(current);

      button.click();
      expect(dialog.classList.contains("visible")).toBe(true);
      expect(input.value).toBe(current);

      input.value = dName === "(none)" ? "" : dName;
      event = new KeyboardEvent("keyup", {
        key: "Enter"
      });
      input.dispatchEvent(event);
      button.focus();

      expect(button.firstChild.nodeValue).toBe(input.value);

      const exports = rules.exportJSON();
      if (dName !== "(none)") {
        expect("groupDistortions" in exports).toBe(true);
        expect(exports.groupDistortions[propName]).toBe(dName);
      }
      else if ("groupDistortions" in exports) {
        expect(propName in exports.groupDistortions).toBe(false);
      }

      {
        const list = window.document.getElementById("distortions-groups-list");
        const options = list.options;
        let found = false;
        for (let i = 0; i < options.length; i++) {
          if (options[i].firstChild.nodeValue !== dName)
            continue;
          found = true;
          break;
        }
        expect(found).toBe(true, `datalist should have option ${dName}`);
      }
    }

    it("can specify group distortions", function() {
      window.DecrementCounter.prototype.doNothing = function() {};
      window.DecrementCounter.prototype._null = null;
      rules = window.setupRules(window.DecrementCounter.prototype);

      // "value", which is a number
      {
        const cell = rules.gridtree.getCell(2, groupCol);
        expect(cell.childNodes.length).toBe(0);
      }

      setSecondaryDistortion(3, "(none)");
      setSecondaryDistortion(3, "foo");
      setSecondaryDistortion(4, "foo");

      // "_null", which is null
      {
        const cell = rules.gridtree.getCell(5, groupCol);
        expect(cell.childNodes.length).toBe(0);
      }

      {
        const exports = rules.exportJSON();
        expect("groupDistortions" in exports).toBe(true);
        expect(exports.groupDistortions.subtractOne).toBe("foo");
        expect(exports.groupDistortions.doNothing).toBe("foo");
      }

      setSecondaryDistortion(3, "bar");
      {
        const exports = rules.exportJSON();
        expect("groupDistortions" in exports).toBe(true);
        expect(exports.groupDistortions.subtractOne).toBe("bar");
        expect(exports.groupDistortions.doNothing).toBe("foo");
      }
    });

    describe("can import configurations", function() {
      let expectedConfig;
      function runImportTest() {
        rules.importJSON(testConfig);
        const exported = rules.exportJSON();
        expect(exported).toEqual(expectedConfig);
      }

      beforeEach(function() {
        setTestConfig();
        testConfig.filterOwnKeys = [
          "arguments", "caller", "length", "name", "prototype"
        ];
        expectedConfig = testConfig;
        setTestConfig();
        testConfig.filterOwnKeys = [
          "arguments", "caller", "length", "name", "prototype"
        ];

        rules = window.setupRules(window.Counter);
      });

      it("without special settings", function() {
        runImportTest();
      });

      it("with additional ownKeys", function() {
        testConfig.filterOwnKeys.splice(2, 0, "extra");
        runImportTest();
      });

      it("with missing ownKeys", function() {
        testConfig.filterOwnKeys.splice(2, 1);
        expectedConfig.filterOwnKeys.splice(2, 1);
        runImportTest();
      });

      it("with missing and additional ownKeys", function() {
        testConfig.filterOwnKeys.splice(2, 1, "extra");
        expectedConfig.filterOwnKeys.splice(2, 1);
        runImportTest();
      });

      it("with missing proxyTraps", function() {
        testConfig.proxyTraps.splice(11, 2);
        expectedConfig.proxyTraps.splice(11, 2);
        runImportTest();
      });

      [
        "inheritFilter",
        "storeUnknownAsLocal",
        "requireLocalDelete",
        "useShadowTarget",
        "truncateArgList"
      ].forEach(function(key) {
        it(`with ${key} inverted`, function() {
          testConfig[key] = !testConfig[key];
          expectedConfig[key] = !expectedConfig[key];
          runImportTest();
        });
      });

      it("with truncateArgList set to 7", function() {
        testConfig.truncateArgList = 7;
        expectedConfig.truncateArgList = 7;
        runImportTest();
      });
    });
  });
});
