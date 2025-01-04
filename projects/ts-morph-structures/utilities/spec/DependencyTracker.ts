import DependencyTracker from "#utilities/source/DependencyTracker.js";
import { Deferred } from "#utilities/source/PromiseTypes.js";

import { setImmediate as setImmediatePromise } from "timers/promises";

it("DependencyTracker", async () => {
  const tracker = new DependencyTracker<number>;
  tracker.addPromise("one", Promise.resolve(1));

  const two = new Deferred<number>;
  tracker.addPromise("two", two.promise, ["one"]);

  const three = new Deferred<number>;
  tracker.addPromise("three", three.promise);

  tracker.addPromise("four", Promise.resolve(4));
  tracker.addDependencies("four", ["three", "five"]);

  {
    const names = tracker.unresolvedNames;
    const dependencies = tracker.unresolvedDependencies;
    expect(names.size).toBe(4);
    expect(names.has("one")).toBe(true);
    expect(names.has("two")).toBe(true);
    expect(names.has("three")).toBe(true);
    expect(names.has("four")).toBe(true);

    expect(dependencies.size).toBe(5);
    expect(dependencies.has("one")).toBe(true);
    expect(dependencies.has("two")).toBe(true);
    expect(dependencies.has("three")).toBe(true);
    expect(dependencies.has("four")).toBe(true);
    expect(dependencies.has("five")).toBe(true);
  }

  const five = new Deferred<number>;
  tracker.addPromise("five", five.promise);

  const six = new Deferred<number>;
  tracker.addPromise("six", six.promise, ["two", "five"]);

  {
    const names = tracker.unresolvedNames;
    const dependencies = tracker.unresolvedDependencies;
    expect(names.size).toBe(6);
    expect(names.has("one")).withContext("one").toBe(true);
    expect(names.has("two")).withContext("two").toBe(true);
    expect(names.has("three")).withContext("three").toBe(true);
    expect(names.has("four")).withContext("four").toBe(true);
    expect(names.has("five")).withContext("five").toBe(true);
    expect(names.has("six")).withContext("six").toBe(true);

    expect(dependencies.size).toBe(6);
    expect(dependencies.has("one")).withContext("one").toBe(true);
    expect(dependencies.has("two")).withContext("two").toBe(true);
    expect(dependencies.has("three")).withContext("three").toBe(true);
    expect(dependencies.has("four")).withContext("four").toBe(true);
    expect(dependencies.has("five")).withContext("five").toBe(true);
    expect(dependencies.has("six")).withContext("six").toBe(true);
  }

  // one is resolved but blocked by the tracker not having started
  const started = Promise.race([
    tracker.awaitedMap.get("one")!.then(() => Promise.resolve("fail")),
    setImmediatePromise("pass"),
  ]);
  await expectAsync(started).toBeResolvedTo("pass");

  const finalMapPromise = tracker.run();
  await tracker.awaitedMap.get("one")!;
  {
    const names = tracker.unresolvedNames;
    expect(names.size).toBe(5);
    expect(names.has("two")).withContext("two").toBe(true);
    expect(names.has("three")).withContext("three").toBe(true);

    // four is resolved, but blocked by 5
    expect(names.has("four")).withContext("four").toBe(true);
    expect(names.has("five")).withContext("five").toBe(true);
    expect(names.has("six")).withContext("six").toBe(true);

    const namesArray = Array.from(names);
    namesArray.sort();

    const depsArray = Array.from(tracker.unresolvedDependencies);
    depsArray.sort();
    expect(namesArray).toEqual(depsArray);
  }

  two.resolve(2);
  await tracker.awaitedMap.get("two")!;
  {
    const names = tracker.unresolvedNames;
    expect(names.size).toBe(4);
    expect(names.has("three")).toBe(true);

    // four is resolved, but blocked by 5
    expect(names.has("four")).toBe(true);
    expect(names.has("five")).toBe(true);
    expect(names.has("six")).toBe(true);

    const namesArray = Array.from(names);
    namesArray.sort();

    const depsArray = Array.from(tracker.unresolvedDependencies);
    depsArray.sort();
    expect(namesArray).toEqual(depsArray);
  }

  three.resolve(3);
  await tracker.awaitedMap.get("three")!;
  {
    const names = tracker.unresolvedNames;
    expect(names.size).toBe(3);

    // four is resolved, but blocked by 5
    expect(names.has("four")).toBe(true);
    expect(names.has("five")).toBe(true);
    expect(names.has("six")).toBe(true);

    const namesArray = Array.from(names);
    namesArray.sort();

    const depsArray = Array.from(tracker.unresolvedDependencies);
    depsArray.sort();
    expect(namesArray).toEqual(depsArray);
  }

  five.resolve(5); // this unblocks four

  await Promise.all([
    tracker.awaitedMap.get("five")!,
    tracker.awaitedMap.get("four")!
  ]);

  {
    const names = tracker.unresolvedNames;
    expect(names.size).toBe(1);
    expect(names.has("six")).toBe(true);

    const namesArray = Array.from(names);
    namesArray.sort();

    const depsArray = Array.from(tracker.unresolvedDependencies);
    depsArray.sort();
    expect(namesArray).toEqual(depsArray);
  }

  six.resolve(6);
  await tracker.awaitedMap.get("six")!;
  {
    const names = Array.from(tracker.unresolvedNames);
    const dependencies = Array.from(tracker.unresolvedDependencies);
    expect(names).toEqual([]);
    expect(dependencies).toEqual(names);
  }

  const finalMap = await finalMapPromise;
  expect(Array.from(finalMap.entries())).toEqual([
    ["one", 1],
    ["two", 2],
    ["three", 3],
    ["four", 4],
    ["five", 5],
    ["six", 6],
  ]);
});
