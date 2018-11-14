/**
 * Simulating a minimalist HTML document.
 */
const Mocks = (function() {
  "use strict";
  const rv = [];
  function buildMock(name, color, graph, parent)
  {
    const mock = {
      name: name,
      color: color,
      graph: graph,
      childNodes: [],
      depth: 0,
      parent: null,
    };
    if (parent)
    {
      parent.childNodes.push(mock);
      mock.depth = parent.depth + 1;
      mock.parent = parent;
    }
    rv.push(mock);
    return mock;
  }

  const doc = buildMock("#document", "purple", "wet", null);
  const ELEMENT = "white";
  const html = buildMock("html", ELEMENT, "wet", doc);
  const head = buildMock("head", ELEMENT, "wet", html);
  buildMock("title", ELEMENT, "wet", head);
  const body = buildMock("body", ELEMENT, "wet", html);

  buildMock("load", 0x00ff00, "dry", body); // load event listener

  return rv;
})();
void(Mocks);
