describe("A function will have rules configurations", function() {
  var window, OGM, DM;
  beforeEach(async function() {
    await getDocumentLoadPromise("base/gui/index.html");
    await getGUIMocksPromise(["Element"]);
    window = testFrame.contentWindow;
    OGM = window.OuterGridManager;
    DM = window.DistortionsManager;

    const graphRadio = OGM.graphNamesCache.firstRadioElements[1];
    graphRadio.nextElementSibling.nextElementSibling.click();
  });

  afterEach(function() {
    window = null;
    OGM = null;
  });

  it("for the function", function() {
    expect(OGM.valueRadio.checked).toBe(true);
    expect(OGM.tabboxForm.functionTraps.value).toBe("value");

    const section = OGM.getSelectedPanel();
    expect(section.dataset.valueName).toBe("parts.dry.Element");
    expect(parseInt(section.dataset.graphIndex, 10)).toBe(1);
    expect(section.getAttribute("trapstab")).toBe("value");

    const hash = section.dataset.hash;
    const map = DM.valueNameToRulesMap.get(hash);

    /*
    "about": {
      "valueName": "parts.dry.Element",
      "isFunction": true,
      "getExample": "  return MembraneMocks().dry.Element;",
      "getInstance": "  return new ctor({}, \"foo\");"
    }
    */
    expect("about" in map).toBe(true);
    expect(map.about.valueName).toBe("parts.dry.Element");
    expect(map.about.isFunction).toBe(true);
    expect(map.about.getExample).toBe("  return MembraneMocks().dry.Element;");
    expect("getInstance" in map.about).toBe(false);

    expect("value" in map).toBe(true);
    expect(map.value instanceof window.DistortionsRules).toBe(true);

    // This also shows that map.value.initByRules() has run.
    expect(typeof map.value.value).toBe("function");
    expect(map.value.gridtree).toBe(section.lastElementChild);

    expect(OGM.valueRadio.disabled).toBe(false);
    expect(OGM.prototypeRadio.disabled).toBe(false);
    expect(OGM.instanceRadio.disabled).toBe(false);
  });

  it("for the function's prototype", function() {
    OGM.prototypeRadio.click();

    expect(OGM.tabboxForm.functionTraps.value).toBe("proto");

    const panel = OGM.getSelectedPanel();
    expect(panel.getAttribute("trapstab")).toBe("proto");
    expect(panel.dataset.valueName).toBe("parts.dry.Element.prototype");

    const hash = panel.dataset.hash;
    const map = DM.valueNameToRulesMap.get(hash);

    expect("about" in map).toBe(true);
    expect(map.about.valueName).toBe("parts.dry.Element");
    expect(map.about.isFunction).toBe(true);
    expect(map.about.getExample).toBe("  return MembraneMocks().dry.Element;");
    expect("getInstance" in map.about).toBe(false);

    expect("value" in map).toBe(true);
    expect(map.value instanceof window.DistortionsRules).toBe(true);
    expect(typeof map.value.value).toBe("function");

    // But we really care about the prototype information.
    expect("proto" in map).toBe(true);
    expect(map.proto instanceof window.DistortionsRules).toBe(true);
    expect(typeof map.proto.value).toBe("object");

    expect(OGM.valueRadio.disabled).toBe(false);
    expect(OGM.prototypeRadio.disabled).toBe(false);
    expect(OGM.instanceRadio.disabled).toBe(false);
  });

  it("for a direct instance of the function", async function() {
    OGM.instanceRadio.click();

    expect(OGM.tabboxForm.functionTraps.value).toBe("instance");

    const panel = OGM.getSelectedPanel();
    expect(panel.getAttribute("trapstab")).toBe("instance");
    expect(panel.dataset.valueName).toBe("parts.dry.Element:instance");

    const hash = panel.dataset.hash;
    const map = DM.valueNameToRulesMap.get(hash);

    expect("about" in map).toBe(true);
    expect(map.about.valueName).toBe("parts.dry.Element");
    expect(map.about.isFunction).toBe(true);
    expect(map.about.getExample).toBe("  return MembraneMocks().dry.Element;");

    expect("value" in map).toBe(true);
    expect(map.value instanceof window.DistortionsRules).toBe(true);
    expect(typeof map.value.value).toBe("function");

    // This is because we haven't given example source code yet.
    expect("instance" in map).toBe(false);

    {
      let source = panel.exampleEditor.getValue();
      source = source.replace("ctor()", `ctor({}, "foo")`);
      panel.exampleEditor.setValue(source);
    }
    const submitButton = panel.getElementsByClassName("submitButton")[0];

    submitButton.click();
    await MessageEventPromise(window, "instanceof panel initialized");

    expect("instance" in map).toBe(true);
    expect(map.instance instanceof window.DistortionsRules).toBe(true);
    expect(typeof map.instance.value).toBe("object");
    expect(map.about.getInstance).toBe("  return new ctor({}, \"foo\");");


    expect(OGM.valueRadio.disabled).toBe(false);
    expect(OGM.prototypeRadio.disabled).toBe(false);
    expect(OGM.instanceRadio.disabled).toBe(false);

    expect(submitButton.disabled).toBe(true);
    expect(submitButton.nextElementSibling.disabled).toBe(true);
    expect(
      window.CodeMirrorManager.getEditorEnabled(panel.exampleEditor)
    ).toBe(false);
  });
});

it(
  "An object will have rules configurations for the object only",
  async function() {
    var window, OGM, DM;
    await getDocumentLoadPromise("base/gui/index.html");
    await getGUIMocksPromise(["doc"]);
    window = testFrame.contentWindow;
    OGM = window.OuterGridManager;
    DM = window.DistortionsManager;

    const graphRadio = OGM.graphNamesCache.firstRadioElements[1];
    graphRadio.nextElementSibling.nextElementSibling.click();

    expect(OGM.valueRadio.checked).toBe(true);
    expect(OGM.tabboxForm.functionTraps.value).toBe("value");

    const section = OGM.getSelectedPanel();
    expect(section.dataset.valueName).toBe("parts.dry.doc");
    expect(parseInt(section.dataset.graphIndex, 10)).toBe(1);
    expect(section.getAttribute("trapstab")).toBe("value");

    const hash = section.dataset.hash;
    const map = DM.valueNameToRulesMap.get(hash);

    expect("about" in map).toBe(true);
    expect(map.about.valueName).toBe("parts.dry.doc");
    expect(map.about.isFunction).toBe(false);
    expect(map.about.getExample).toBe("  return MembraneMocks().dry.doc;");
    expect("getInstance" in map.about).toBe(false);

    expect("value" in map).toBe(true);
    expect(map.value instanceof window.DistortionsRules).toBe(true);

    // This also shows that map.value.initByRules() has run.
    expect(typeof map.value.value).toBe("object");
    expect(map.value.gridtree).toBe(section.lastElementChild);

    expect(OGM.valueRadio.disabled).toBe(false);
    expect(OGM.prototypeRadio.disabled).toBe(true);
    expect(OGM.instanceRadio.disabled).toBe(true);
  }
);
