// This file _should_ be generated, but it's not worth it.

import NotImplementedStub from "./stub-generators/base/notImplemented.mjs";
import PrependReturnStub from "./stub-generators/base/prependReturn.mjs";
import PrependReturnNIStub from "./stub-generators/base/prependReturnNI.mjs";
import SpyClassStub from "./stub-generators/base/spyClass.mjs";
import VoidClassStub from "./stub-generators/base/voidClass.mjs";

import TransitionsStub from "./stub-generators/transitions/baseStub.mjs";
import TransitionsHeadStub from "./stub-generators/transitions/HeadClass.mjs";
import TransitionsTailStub from "./stub-generators/transitions/TailClass.mjs";

const StubMap = Object.freeze({
  "NotImplemented": NotImplementedStub,
  "PrependReturn": PrependReturnStub,
  "PrependReturnNI": PrependReturnNIStub,
  "SpyClass": SpyClassStub,
  "VoidClass": VoidClassStub,
  "TransitionsStub": TransitionsStub,
  "TransitionsHeadStub": TransitionsHeadStub,
  "TransitionsTailStub": TransitionsTailStub,
});

export default StubMap;
