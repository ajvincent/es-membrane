import {
  BottomUpSearchForChildEdges,
} from "../../../source/engine262-tools/search/BottomUpSearchForChildEdges.js";

import {
  ReferenceGraphImpl,
} from "../../../source/engine262-tools/search/ReferenceGraphImpl.js";

import type {
  ArrayIndexEdge,
  ChildToParentReferenceGraphEdge,
  ReferenceGraphNode,
} from "../../../source/types/ReferenceGraph.js";

import {
  BuiltInJSTypeName,
  ChildReferenceEdgeType
} from "../../../source/utilities/constants.js";

describe("BottomUpSearchForChildEdges", () => {
  let TopSearchGraph: ReferenceGraphImpl, ExpectedGraph: ReferenceGraphImpl;
  beforeEach(() => {
    TopSearchGraph = new ReferenceGraphImpl;
    ExpectedGraph = new ReferenceGraphImpl;

    TopSearchGraph.foundTargetValue = true;
    TopSearchGraph.succeeded = true;

    ExpectedGraph.foundTargetValue = true;
    ExpectedGraph.succeeded = true;
  });

  //#region utilities
  function addObjectToGraphs(
    includeExpectedGraph: boolean,
    objectKey: number,
    builtInClassName: BuiltInJSTypeName,
    derivedClassName: string,
  ): void
  {
    const node: ReferenceGraphNode = {
      objectKey,
      builtInJSTypeName: builtInClassName,
      derivedClassName,
    };
    TopSearchGraph.nodes.push(node);
    if (includeExpectedGraph) {
      ExpectedGraph.nodes.push(node);
    }
  }

  function addArrayIndexEdge(
    includeExpectedGraph: boolean,
    parentObjectKey: number,
    arrayIndex: number,
    childObjectKey: number,
    parentToChildEdgeId: number,
  ): void
  {
    const arrayEdge: ArrayIndexEdge = {
      parentObjectKey,
      arrayIndex,
      childObjectKey,
      parentToChildEdgeId,
      isStrongOwningReference: true,
      parentToChildEdgeType: ChildReferenceEdgeType.ArrayIndex,
    };

    const childToParentEdges: ChildToParentReferenceGraphEdge = {
      childObjectKey,
      jointOwnerKeys: [parentObjectKey],
      parentToChildEdgeId
    };

    TopSearchGraph.parentToChildEdges.push(arrayEdge);
    TopSearchGraph.childToParentEdges.push(childToParentEdges);

    if (includeExpectedGraph) {
      ExpectedGraph.parentToChildEdges.push(arrayEdge);
      ExpectedGraph.childToParentEdges.push(childToParentEdges);
    }
  }

  //#endregion utilities

  it("returns a compacted ReferenceGraph", () => {
    const target = { isTarget: true };

    const differentTargetName = target;
    const isFirstValue = { isFirstValue: true };
    const isLastValue = { isLastValue: true };

    const heldValues: readonly object[] = [
      isFirstValue,
      differentTargetName,
      isLastValue,
    ];
  
    //searchReferences("targetHeldValuesArray", target, heldValues, true);
    void(heldValues);

    // The codes themselves are nearly meaningless.  The goal is uniqueness.
    const GraphCodes: Record<string, number> = {
      target: 0,
      heldValues: 1,

      // objects
      isFirstValue: 1000,
      isLastValue: 1001,

      FirstHeldValueEdgeId: 2000,
      SecondHeldValueEdgeId: 2001,
      ThirdHeldValueEdgeId: 2002,
    };
    addObjectToGraphs(true, GraphCodes.target, BuiltInJSTypeName.Object, "Object");
    addObjectToGraphs(true, GraphCodes.heldValues, BuiltInJSTypeName.Array, "Array");

    addObjectToGraphs(false, GraphCodes.isFirstValue, BuiltInJSTypeName.Object, "Object");
    addObjectToGraphs(false, GraphCodes.isLastValue, BuiltInJSTypeName.Object, "Object");
  
    addArrayIndexEdge(false, GraphCodes.heldValues, 0, GraphCodes.isFirstValue, GraphCodes.FirstHeldValueEdgeId);
    addArrayIndexEdge(true, GraphCodes.heldValues, 1, GraphCodes.target, GraphCodes.SecondHeldValueEdgeId);
    addArrayIndexEdge(false, GraphCodes.heldValues, 2, GraphCodes.isLastValue, GraphCodes.ThirdHeldValueEdgeId);

    BottomUpSearchForChildEdges.sortBottomUpGraphArrays(ExpectedGraph);

    const edgeSearch = new BottomUpSearchForChildEdges(TopSearchGraph);
    edgeSearch.run();
    const ActualSearchGraph = edgeSearch.bottomUpGraph;

    expect(ActualSearchGraph).toEqual(ExpectedGraph);
  });
});
