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
  addArrayIndexEdge,
  addInternalSlotEdge,
  addObjectGraphNode,
  addScopeValueEdge,
  createExpectedGraph,
} from "../../support/fillExpectedGraph.js";

import {
  getActualGraph,
} from "../../support/getActualGraph.js";
//#endregion preamble

/* This test may seem redundant (aren't we testing how promises work?), but what
 * we're actually after here is the traceability of the target object.
 */
describe("Simple graph searches, promises: references to the target", () => {
  let ExpectedObjectGraph: ObjectGraphImpl<GraphObjectMetadata, GraphRelationshipMetadata>;
  const target = { isTarget: true };
  const promise = Promise.resolve(target);
  const fulfullReactions: readonly never[] = [];
  const rejectReactions: readonly never[] = [];
  const callback = () => target;

  function addReactions()
  {
    addObjectGraphNode(ExpectedObjectGraph, fulfullReactions, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array);
    addInternalSlotEdge(ExpectedObjectGraph, promise, `[[PromiseFulfillReactions]]`, fulfullReactions, true);
    addObjectGraphNode(ExpectedObjectGraph, rejectReactions, BuiltInJSTypeName.Array, BuiltInJSTypeName.Array);
    addInternalSlotEdge(ExpectedObjectGraph, promise, `[[PromiseRejectReactions]]`, rejectReactions, true);
  }

  function addSettleCallback(
    shouldDefine: boolean,
    willFulfill: boolean
  ): void
  {
    if (shouldDefine) {
      addObjectGraphNode(ExpectedObjectGraph, callback, BuiltInJSTypeName.Function, BuiltInJSTypeName.Function);
    }
    const reactions: readonly never[] = willFulfill ? fulfullReactions : rejectReactions;
    addArrayIndexEdge(ExpectedObjectGraph, reactions, 0, callback, false);

    addScopeValueEdge(ExpectedObjectGraph, callback, "[[return value]]", target);
  }

  function summarize(): object {
    ExpectedObjectGraph.markStrongReferencesFromHeldValues();
    ExpectedObjectGraph.summarizeGraphToTarget(true);
    const expected = graphlib.json.write(ExpectedObjectGraph.cloneGraph());
    return expected;
  }

  beforeEach(() => {
    [ExpectedObjectGraph] = createExpectedGraph(
      target, BuiltInJSTypeName.Object, BuiltInJSTypeName.Object,
      promise, BuiltInJSTypeName.Promise, BuiltInJSTypeName.Promise
    );
  });

  it("exist when resolved", async () => {
    addInternalSlotEdge(ExpectedObjectGraph, promise, `[[PromiseResult]]`, target, true);
    const expected = summarize();

    const actual = await getActualGraph(
      "simple/promises.js", "promise directly resolved to target", false
    );
    expect(actual).toEqual(expected);
  });

  it("exist when rejected", async () => {
    addInternalSlotEdge(ExpectedObjectGraph, promise, `[[PromiseResult]]`, target, true);
    const expected = summarize();

    const actual = await getActualGraph(
      "simple/promises.js", "promise directly rejected to target", false
    );
    expect(actual).toEqual(expected);
  });

  //#region then, resolve()
  it("exist as a fulfill reaction, before resolve", async () => {
    addReactions();
    addSettleCallback(true, true);
    const expected = summarize();

    const actual = await getActualGraph(
      "simple/promises.js", "promise.then() to target, before resolve", false
    );
    expect(actual).toEqual(expected);
  });

  it("do not exist on promises, pending fulfill", async () => {
    const actual = await getActualGraph(
      "simple/promises.js", "promise.then() pending target, before resolve", false
    );
    expect(actual).toEqual(null);
  });

  it("do not exist when fulfilling to target, after resolve", async () => {
    const actual = await getActualGraph(
      "simple/promises.js", "promise.then() to target, after resolve", false
    );
    expect(actual).toEqual(null);
  });

  it("exist as a fulfilled value via resolve()", async () => {
    addInternalSlotEdge(ExpectedObjectGraph, promise, `[[PromiseResult]]`, target, true);
    const expected = summarize();

    const actual = await getActualGraph(
      "simple/promises.js", "promise.then() resolved to target", false
    );
    expect(actual).toEqual(expected);
  });
  //#endregion then, resolve()

  //#region catch, resolve()
  it("exist as a reject reaction, before resolve", async () => {
    addReactions();
    addSettleCallback(true, false);

    const expected = summarize();

    const actual = await getActualGraph(
      "simple/promises.js", "promise.catch() to target, before resolve", false
    );
    expect(actual).toEqual(expected);
  });

  it("do not exist on promises, pending reject", async () => {
    const actual = await getActualGraph(
      "simple/promises.js", "promise.catch() pending target, before resolve", false
    );
    expect(actual).toEqual(null);
  });

  it("do not exist when rejecting to target, after resolve", async () => {
    const actual = await getActualGraph(
      "simple/promises.js", "promise.catch() to target, after resolve", false
    );
    expect(actual).toEqual(null);
  });

  it("do not exist as a fulfilled value via reject()", async () => {
    const actual = await getActualGraph(
      "simple/promises.js", "promise.catch() resolved to target", false
    );
    expect(actual).toEqual(null);
  });
  //#endregion catch, resolve()

  //#region finally, resolve()
  xit("exist as a finally reaction, before resolve", async () => {
    addReactions();
    addSettleCallback(true, true);
    addSettleCallback(false, true);

    const expected = summarize();

    const actual = await getActualGraph(
      "simple/promises.js", "promise.finally() to target, before resolve", false
    );
    expect(actual).toEqual(expected);
  });

  it("do not exist as a finally reaction, after resolve", async () => {
    const actual = await getActualGraph(
      "simple/promises.js", "promise.finally() to target, after resolve", false
    );
    expect(actual).toEqual(null);
  })
  //#endregion finally, resolve()

  //#region then, reject()
  it("do not exist when fulfilling to target, after reject", async () => {
    const actual = await getActualGraph(
      "simple/promises.js", "promise.then() to target, after reject", false
    );
    expect(actual).toEqual(null);
  });

  it("do not exist as a fulfilled value via reject()", async () => {
    const actual = await getActualGraph(
      "simple/promises.js", "promise.then() rejected to target", false
    );
    expect(actual).toEqual(null);
  });
  //#endregion then, reject()

  //#region catch, reject()
  it("do not exist when fulfilling to target, after reject", async () => {
    const actual = await getActualGraph(
      "simple/promises.js", "promise.catch() to target, after reject", false
    );
    expect(actual).toEqual(null);
  });


  it("exist as a rejected value via reject()", async () => {
    addInternalSlotEdge(ExpectedObjectGraph, promise, `[[PromiseResult]]`, target, true);
    const expected = summarize();

    const actual = await getActualGraph(
      "simple/promises.js", "promise.catch() rejected to target", false
    );
    expect(actual).toEqual(expected);
  });
  //#endregion catch, reject()

  //#region finally, reject()
  it("do not exist as a finally reaction, after reject", async () => {
    const actual = await getActualGraph(
      "simple/promises.js", "promise.finally() to target, after reject", false
    );
    expect(actual).toEqual(null);
  });
  //#endregion finally, reject()
});
