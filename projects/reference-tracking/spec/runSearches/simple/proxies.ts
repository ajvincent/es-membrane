//#region preamble
import graphlib from "@dagrejs/graphlib";

import {
  ObjectGraphImpl
} from "../../../source/graph-analysis/ObjectGraphImpl.js";

import type {
  GraphObjectMetadata
} from "../../../source/types/GraphObjectMetadata.js";

import type {
  GraphRelationshipMetadata
} from "../../../source/types/GraphRelationshipMetadata.js";

import {
  BuiltInJSTypeName
} from "../../../source/utilities/constants.js";

import {
  addObjectGraphNode,
  addArrayIndexEdge,
  addInternalSlotEdge,
  addPropertyNameEdge,
} from "../../support/fillExpectedGraph.js";

import {
  getActualGraph
} from "../../support/getActualGraph.js";
//#endregion preamble

describe("Simple graph searches, proxy support:", () => {
  const target = { isTarget: true, }, heldValues = { isHeldValues: true };

  const targetMetadata: GraphObjectMetadata = {
    builtInJSTypeName: BuiltInJSTypeName.Object,
    derivedClassName: BuiltInJSTypeName.Object,
  };

  const heldValuesMetadata: GraphObjectMetadata = {
    builtInJSTypeName: BuiltInJSTypeName.Array,
    derivedClassName: BuiltInJSTypeName.Array
  };

  interface SearchTargetIfc {
    readonly searchTarget: {
      readonly searchTargetOf: string
    }
  }

  const proxy = { name: "proxy" }, revoke = { name: "revoke" };

  const shadowTarget: SearchTargetIfc = {
    searchTarget: {
      searchTargetOf: "shadowTarget"
    }
  };

  const NotImplementedProxyHandler: SearchTargetIfc =
  {
    searchTarget: {
      searchTargetOf: "ProxyHandler"
    },
  };

  let ExpectedObjectGraph: ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;
  beforeEach(() => {
    ExpectedObjectGraph = new ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;

    ExpectedObjectGraph.defineTargetAndHeldValues(
      target, targetMetadata, heldValues, heldValuesMetadata
    );
  });

  function getExpectedGraph(): object {
    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);

    return graphlib.json.write(ExpectedObjectGraph.cloneGraph());
  }

  it("proxies hold shadow targets before revocation", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, proxy, BuiltInJSTypeName.Proxy, BuiltInJSTypeName.Proxy);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, proxy, false);

      addInternalSlotEdge(ExpectedObjectGraph, proxy, `[[ProxyTarget]]`, target, true);

      addObjectGraphNode(ExpectedObjectGraph, NotImplementedProxyHandler, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addInternalSlotEdge(ExpectedObjectGraph, proxy, `[[ProxyHandler]]`, NotImplementedProxyHandler, true);
    }

    const expected = getExpectedGraph();
    const actual = await getActualGraph(
      "simple/proxies.js",
      "shadow target held before revocation",
      true
    );

    expect(actual).toEqual(expected);
  });

  it("proxies hold proxy handlers before revocation", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, proxy, BuiltInJSTypeName.Proxy, BuiltInJSTypeName.Proxy);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, proxy, false);

      addObjectGraphNode(ExpectedObjectGraph, shadowTarget, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addInternalSlotEdge(ExpectedObjectGraph, proxy, `[[ProxyTarget]]`, shadowTarget, true);

      addInternalSlotEdge(ExpectedObjectGraph, proxy, `[[ProxyHandler]]`, target, true);
    }

    const expected = getExpectedGraph();
    const actual = await getActualGraph(
      "simple/proxies.js",
      "proxy handler held before revocation",
      true
    );

    expect(actual).toEqual(expected);
  });

  it("revokers hold proxies before revocation", async () => {
    ExpectedObjectGraph = new ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;

    const targetMetadata: GraphObjectMetadata = {
      builtInJSTypeName: BuiltInJSTypeName.Proxy,
      derivedClassName: BuiltInJSTypeName.Proxy,
    };

    ExpectedObjectGraph.defineTargetAndHeldValues(
      target, targetMetadata, heldValues, heldValuesMetadata
    );
    {
      addObjectGraphNode(ExpectedObjectGraph, revoke, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, revoke, false);

      addInternalSlotEdge(ExpectedObjectGraph, revoke, `[[RevocableProxy]]`, target, true);
    }

    const expected = getExpectedGraph();
    const actual = await getActualGraph(
      "simple/proxies.js",
      "proxy held before revocation",
      true
    );

    expect(actual).toEqual(expected);
  });

  it("proxies do not hold references to their revokers", async () => {
    const actual = await getActualGraph(
      "simple/proxies.js",
      "revoke not held by proxy",
      true
    );
    expect(actual).toBeNull();
  });

  it("proxies do not search shadow target", async () => {
    const actual = await getActualGraph(
      "simple/proxies.js",
      "shadow search target",
      true
    );
    expect(actual).toBeNull();
  });

  it("proxies search proxy handlers", async () => {
    {
      addObjectGraphNode(ExpectedObjectGraph, proxy, BuiltInJSTypeName.Proxy, BuiltInJSTypeName.Proxy);
      addArrayIndexEdge(ExpectedObjectGraph, heldValues, 0, proxy, false);

      addObjectGraphNode(ExpectedObjectGraph, shadowTarget, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addInternalSlotEdge(ExpectedObjectGraph, proxy, `[[ProxyTarget]]`, shadowTarget, true);

      addObjectGraphNode(ExpectedObjectGraph, NotImplementedProxyHandler, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object);
      addInternalSlotEdge(ExpectedObjectGraph, proxy, `[[ProxyHandler]]`, NotImplementedProxyHandler, true);

      addPropertyNameEdge(ExpectedObjectGraph, NotImplementedProxyHandler, "searchTarget", target, false);
    }

    const expected = getExpectedGraph();
    const actual = await getActualGraph(
      "simple/proxies.js",
      "proxy handler search target",
      true
    );

    expect(actual).toEqual(expected);
  });

  it("proxies do not hold references to their targets after revocation", async () => {
    const actual = await getActualGraph(
      "simple/proxies.js",
      "shadow target held by proxy after revocation",
      true
    );
    expect(actual).toBeNull();
  });

  it("proxies do not hold references to their proxy handlers after revocation", async () => {
    const actual = await getActualGraph(
      "simple/proxies.js",
      "proxy handler held by proxy after revocation",
      true
    );
    expect(actual).toBeNull();
  });

  it("revokers do not hold references to their proxies after revocation", async () => {
    const actual = await getActualGraph(
      "simple/proxies.js",
      "proxy held after revocation",
      true
    );
    expect(actual).toBeNull();
  });
});
