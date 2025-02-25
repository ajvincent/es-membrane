import {
  StringCounter
} from "../../source/utilities/StringCounter.js";

it("StringCounter provides an endless stream of strings", () => {
  const counter = new StringCounter<"foo", "bar" | "wop">("foo");
  expect(counter.base()).toBe("foo:0");
  expect(counter.base()).toBe("foo:1");
  expect(counter.base()).toBe("foo:2");

  expect(counter.other("bar")).toBe("bar:3");
  expect(counter.other("wop")).toBe("wop:4");
  expect(counter.base()).toBe("foo:5");
});
