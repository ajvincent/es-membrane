import {
  StringCounter
} from "../../source/utilities/StringCounter.js";

it("StringCounter provides an endless stream of strings", () => {
  const counter = new StringCounter<"foo", "bar" | "wop">("foo");
  expect(counter.next().value).toBe("foo:0");
  expect(counter.next().value).toBe("foo:1");
  expect(counter.next().value).toBe("foo:2");

  expect(counter.next("bar").value).toBe("bar:3");
  expect(counter.next("wop").value).toBe("wop:4");
  expect(counter.next().value).toBe("foo:5");
});
