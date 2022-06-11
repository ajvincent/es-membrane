import type {
  ComponentPassThroughMap,
} from "../source/PassThroughSupport.mjs";

import type {
  NumberStringType
} from "../spec/fixtures/NumberStringType.mjs";

import {
  NST_CONTINUE,
  NST_RESULT,
  NST_THROW,
} from "./fixtures/NST_INSTANCES.mjs";

import {
  NumberStringType_Driver,
  NumberStringType_ClassesUnderTest
} from "./fixtures/NSPT_GENERATED.mjs";

it("DirectDriver mockup returns a sane value", () => {
  const NST_COMPONENT_MAP: ComponentPassThroughMap<NumberStringType> = new Map;
  NST_COMPONENT_MAP.set("continue", NST_CONTINUE);
  NST_COMPONENT_MAP.set("result", NST_RESULT);
  NST_COMPONENT_MAP.set("throw", NST_THROW);
  
  NumberStringType_Driver.build(
    "driver",
    ["continue", "result", "throw"],
    NST_COMPONENT_MAP
  );
  
  const TestClass = NumberStringType_ClassesUnderTest(
    "driver",
    NST_COMPONENT_MAP
  );

  expect(TestClass.repeatForward("foo", 3)).toBe("foofoofoo");
});
