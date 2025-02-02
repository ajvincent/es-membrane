import path from "node:path";

import * as GuestEngine from "@engine262/engine262";

import { directInvoke } from "../../source/engine262-tools/directInvoke.js";
import { projectRoot } from "../support/projectRoot.js";
import { GuestRealmOutputs } from "../../source/engine262-tools/types/Virtualization262.js";
import { defineEchoFunctions } from "../../source/engine262-tools/echoFunctions.js";

const fixturesDir = path.join(projectRoot, "dist/fixtures/engine262-demos");

xit("echo functions can work", async () => {
  const absolutePathToFile = path.join(fixturesDir, "echo.js");
  const callback = jasmine.createSpy<
    (
      guestThisArg: GuestEngine.Value,
      guestArguments: readonly GuestEngine.Value[],
      guestNewTarget: GuestEngine.Value,
    ) => GuestEngine.Value
  >();

  callback.and.callFake((
    guestThisArg: GuestEngine.Value,
    guestArguments: readonly GuestEngine.Value[],
    guestNewTarget: GuestEngine.Value,
  ): GuestEngine.Value => {
    // eslint-disable-next-line no-debugger
    debugger;
    void(guestThisArg);
    void(guestNewTarget);
    expect(guestArguments.length).toBe(1);
    if (guestArguments.length !== 1)
      return GuestEngine.Value.undefined;
    const [value] = guestArguments;
    expect(value.type).withContext(`object type`).toBe("Object");

    return GuestEngine.Value.undefined;
  });

  const outputs: GuestRealmOutputs = await directInvoke({
    absolutePathToFile,
    defineBuiltIns: defineEchoFunctions,
  }, callback);

  expect(outputs.succeeded).toBeTrue();
  expect(outputs.unhandledPromises.length).toBe(0);

  expect(callback).toHaveBeenCalledTimes(1);
});
