/*
import "../docs/dist/es6-modules/Membrane.js";
*/

if (typeof Membrane != "function") {
  if (typeof require == "function") {
    var { Membrane } = require("../docs/dist/node/es-membrane.js");
  }
  else
    throw new Error("Unable to run tests: cannot get Membrane");
}

describe("ObjectGraph unit tests: ", function() {
  "use strict";
  function initDry() {
    dryObj = membrane.convertArgumentToProxy(wetGraph, dryGraph, wetObj);
  }
  void(initDry);

  let membrane, wetGraph, dryGraph, wetObj, dryObj;
  beforeEach(function() {
    const options = {
      showGraphName: true,
      logger: ((typeof logger == "object") ? logger : null),
      refactor: "0.10",
    };
    membrane = new Membrane(options);
    wetGraph = membrane.getHandlerByName("wet", { mustCreate: true });
    dryGraph = membrane.getHandlerByName("dry", { mustCreate: true });

    wetObj = {};
  });

  afterEach(function() {
    wetGraph.revokeEverything();
    dryGraph.revokeEverything();

    wetGraph = null;
    dryGraph = null;
    membrane = null;

    wetObj = null;
    dryObj = null;
  });

  it("Wrapping a value returns a Proxy for an object", function() {
    initDry();
    expect(typeof dryObj).toBe("object");
    expect(dryObj).not.toBe(wetObj);
    expect(dryObj).not.toBe(null);
  });
});
