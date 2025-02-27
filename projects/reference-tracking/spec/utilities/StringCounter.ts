import {
  StringCounter
} from "../../source/utilities/StringCounter.js";

it("StringCounter provides an endless stream of strings", () => {
  const counter = new StringCounter<"foo" | "bar" | "wop">;
  expect(counter.next("foo")).toBe("foo:0");
  expect(counter.next("foo")).toBe("foo:1");
  expect(counter.next("foo")).toBe("foo:2");

  expect(counter.next("bar")).toBe("bar:3");
  expect(counter.next("wop")).toBe("wop:4");
  expect(counter.next("foo")).toBe("foo:5");
});
