function buildMock(rv, name, color, graph, parent)
{
  "use strict";
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

/**
 * Simulating a minimalist HTML document.
 */
function DOM_Mocks()
{
  "use strict";
  const rv = [];
  const doc = buildMock(rv, "#document", "purple", "wet", null);
  const ELEMENT = "black";
  const html = buildMock(rv, "html", ELEMENT, "wet", doc);
  const head = buildMock(rv, "head", ELEMENT, "wet", html);
  buildMock(rv, "title", ELEMENT, "wet", head);
  const body = buildMock(rv, "body", ELEMENT, "wet", html);

  buildMock(rv, "onload", 0x00ff00, "dry", body); // load event listener

  return rv;
}
void(DOM_Mocks);

function ChildNodes_Mocks()
{
  "use strict";
  const rv = [];
  const ELEMENT = "black";
  const head = buildMock(rv, "head", ELEMENT, "wet", null);
  const children = buildMock(rv, "childNodes", "orange", "wet", head);
  buildMock(rv, "title", ELEMENT, "wet", children);
  buildMock(rv, "meta", ELEMENT, "wet", children);
  buildMock(rv, "link", ELEMENT, "wet", children);
}
void(ChildNodes_Mocks);
