import type {
  NumberStringType
} from "../fixtures/NumberStringType.mjs";

import {
  NST_CONTINUE,
  NST_RESULT,
} from "../fixtures/first-mock/NST_INSTANCES.mjs";

import NumberString_EntryBase from "../fixtures/first-mock/NSPT_ENTRY.mjs";

import InstanceToComponentMap from "../source/exports/KeyToComponentMap_Base.mjs";

it("DirectDriver (first-mock) mockup returns a sane value", () => {
  const NST_COMPONENT_MAP = new InstanceToComponentMap<NumberStringType, NumberStringType>;
  NST_COMPONENT_MAP.addDefaultComponent("continue", NST_CONTINUE);
  NST_COMPONENT_MAP.addDefaultComponent("result", NST_RESULT);

  NST_COMPONENT_MAP.addDefaultSequence(
    "driver",
    ["continue", "result"]
  );

  NST_COMPONENT_MAP.defaultStart = "driver";
  const TestClass = new NumberString_EntryBase(NST_COMPONENT_MAP.defaultKeyMap);

  expect(TestClass.repeatForward("foo", 3)).toBe("foofoofoo");
});
