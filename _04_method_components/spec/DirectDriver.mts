import type {
  ComponentPassThroughMap,
} from "../source/PassThroughSupport.mjs";

import type {
  NumberStringType
} from "./fixtures/NumberStringType.mjs";

import {
  NST_CONTINUE,
  NST_RESULT,
  NST_THROW,
} from "./fixtures/NST_INSTANCES.mjs";

import {
  NumberStringType_Sequence,
  NumberString_ForwardTo
} from "./fixtures/NSPT_GENERATED.mjs";

it("DirectDriver mockup returns a sane value", () => {
  const NST_COMPONENT_MAP: ComponentPassThroughMap<NumberStringType> = new Map;
  NST_COMPONENT_MAP.set("continue", NST_CONTINUE);
  NST_COMPONENT_MAP.set("result", NST_RESULT);
  NST_COMPONENT_MAP.set("throw", NST_THROW);
  
  void(new NumberStringType_Sequence(
    "driver",
    ["continue", "result", "throw"],
    NST_COMPONENT_MAP,
  ));

  const TestClass = new NumberString_ForwardTo("driver", NST_COMPONENT_MAP);
  expect(TestClass.repeatForward("foo", 3)).toBe("foofoofoo");
});
