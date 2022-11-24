import type {
  NumberStringType
} from "../fixtures/NumberStringType.mjs";

import type {
  NumberStringTypeAndLog
} from "../fixtures/log-subtarget/NSPT_ENTRY.mjs";

import {
  NST_RESULT,
  NST_ENTER,
  NST_LEAVE,
} from "../fixtures/log-subtarget/NST_INSTANCES.mjs";

import NumberString_EntryBase from "../fixtures/log-subtarget/NSPT_ENTRY.mjs";

import InstanceToComponentMap from "../source/exports/KeyToComponentMap_Base.mjs";

it("DirectDriver (log-subtarget) mockup returns a sane value", async () => {
  const NST_COMPONENT_MAP = new InstanceToComponentMap<NumberStringType, NumberStringTypeAndLog>;
  NST_COMPONENT_MAP.addDefaultComponent("result", NST_RESULT);
  NST_COMPONENT_MAP.addDefaultComponent("logEnter", NST_ENTER);
  NST_COMPONENT_MAP.addDefaultComponent("logLeave", NST_LEAVE);

  NST_COMPONENT_MAP.defaultStart = "result";
  const TestClass = new NumberString_EntryBase(NST_COMPONENT_MAP.defaultKeyMap);
  expect(TestClass.consoleStream.readableLength).toBe(0);

  expect(TestClass.repeatForward("foo", 3)).toBe("foofoofoo");
  const data = await TestClass.consoleData;
  expect(data).toBe("enter repeatForward\nleave repeatForward\n");
});
