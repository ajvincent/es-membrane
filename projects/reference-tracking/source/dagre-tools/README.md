# This part is not usable yet

As of February 22, 2025, this part of the reference tracking project is being put on ice.  The intent is to build a visualization of the references graph showing how we get from the held values to the target.

I became too excited at this idea, spending an entire Saturday prototyping this when I should have been working on documentation.  So I'll definitely come back to this.  What I'm writing here is a summary of my discoveries over the last week on this subject.

- I based this directory on the idea of a [multigraph](https://en.wikipedia.org/wiki/Multigraph) from graph theory.  I was trying to show both the parent-to-child edges (where properties, private fields, etc. come in) and the child-to-parent edges (where joint ownership comes into play).  Maybe the latter is not necessary, and we can go with just a simple graph.
- [`@dagrejs/dagre`](https://github.com/dagrejs/dagre/wiki) is a library for defining graph nodes and edges in JSON.
  - In particular, it has a layout feature for defining _positions_ of nodes and edges, via its `layout` method.
  - However, I haven't configured it correctly.  With a very simple graph (three nodes, and a few edges), it placed them in a vertical column.
- [D3](https://d3js.org/getting-started) is a library for drawing a graph as SVG.  This has great potential.
  - [npm package](https://www.npmjs.com/package/d3)
  - [npm types package](https://www.npmjs.com/package/@types/d3)
- [`dagre-d3`](https://github.com/dagrejs/dagre-d3) is a package for driving D3 from data `dagre` provides.
  - But it's not really up to date.
  - [`dagre-d3-es`](https://www.npmjs.com/package/dagre-d3-es) is an up-to-date port with TypeScript definitions and ES module support.
  - However, this requires a DOM environment...
- [JSDOM](https://github.com/jsdom/jsdom) is the go-to for a DOM in NodeJS programming...
  - [npm package](https://www.npmjs.com/package/jsdom)
  - [npm types package](https://www.npmjs.com/package/@types/jsdom)
- Integrating these libraries together is a challenge:
  - [D3 + JSDOM](https://gist.github.com/tomgp/c99a699587b5c5465228?permalink_comment_id=2283776#gistcomment-2283776)
  - [D3 + `dagre-de-es`](https://tbo47.github.io/dagre-d3-esm_example1/index.js)
  - When you combine them, you get an error: `TypeError: labelSvg.node(...).getBBox is not a function`
  - [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/SVGGraphicsElement/getBBox) says it's part of SVG and has been forever.
  - [`JSDOM` has an open bug](https://github.com/jsdom/jsdom/issues/2647) that isn't going anywhere towards this.
    - [specification link if anyone's interested](https://svgwg.org/svg2-draft/types.html#__svg__SVGGraphicsElement__getBBox)
- [Cytoscape](https://js.cytoscape.org/) is a Canvas-based approach to rendering graphs.  Very powerful...
  - but because it's Canvas-based, that means JavaScript execution, which [JSDOM explicitly warns us against](https://github.com/jsdom/jsdom?tab=readme-ov-file#executing-scripts).

So that's the state of the work on this so far.  Plus when I'm trying to stabilize / implement my data model, it's too soon to work on visualization.  I was hoping this would be a quick task, to use for my [theory page](../../THEORY.md), but after several hours when the images I need would take maybe thirty minutes to do by hand _each_, it's not worth it right now.

To be continued...
