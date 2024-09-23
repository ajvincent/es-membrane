import fs from "node:fs/promises";
import path from "node:path";

import type {
  PromiseResolver
} from "../source/PromiseTypes.js";

import {
  overwriteFileIfDifferent
} from "../source/overwriteFileIfDifferent.js";

import createFixtureTempDir from "./support/createFixtureTempDir.js";

import {
  DESTINATION_DATE,
  SOURCE_DATE,
  CURRENT_DATE,
  expectDestAccessAndModifiedDates,
} from "./support/fileTimestamps.js";

describe("overwriteFileIfDifferent", () => {
  let tempDir: string, tempDirResolve: PromiseResolver<void>, tempDirPromise: Promise<void>;
  let tempDest: string, tempSrc: string;

  function readDestFile(
    pathToFile: string
  ): Promise<string>
  {
    return fs.readFile(pathToFile, { encoding: "utf-8" });
  }

  function fileContents(value: string): string {
    return `export default "${value}";\n`;
  }

  beforeAll(async () => {
    const withCleanup = await createFixtureTempDir("copyBase");
    tempDir = withCleanup.tempDir;
    tempDirResolve = withCleanup.resolve;
    tempDirPromise = withCleanup.promise;

    tempDest = path.join(tempDir, "dest");
    tempSrc = path.join(tempDir, "src");
  });

  afterAll(async () => {
    tempDirResolve();
    await tempDirPromise;
  });

  describe("does not overwrite matching files when", () => {
    it("the source file matches", async () => {
      const zeroDest = path.join(tempDest, "zero.ts");
      await overwriteFileIfDifferent(
        false,
        path.join(tempSrc, "zero.ts"),
        zeroDest,
        CURRENT_DATE
      );

      await expectDestAccessAndModifiedDates(zeroDest, DESTINATION_DATE, false);

      await expectAsync(
        readDestFile(zeroDest)
      ).toBeResolvedTo(fileContents("zero"));
    });

    it("the source content matches", async () => {
      const oneDest = path.join(tempDest, "one.ts");
      await overwriteFileIfDifferent(
        true,
        fileContents("one"),
        oneDest,
        CURRENT_DATE
      );

      await expectDestAccessAndModifiedDates(oneDest, DESTINATION_DATE, false);

      await expectAsync(
        readDestFile(oneDest)
      ).toBeResolvedTo(fileContents("one"));
    });
  });

  describe("creates the destination file when it does not exist, and we have", () => {
    it("a source file", async () => {
      const twoDest = path.join(tempDest, "two.ts");
      await overwriteFileIfDifferent(
        false,
        path.join(tempSrc, "two.ts"),
        twoDest,
        CURRENT_DATE,
      );

      await expectDestAccessAndModifiedDates(twoDest, CURRENT_DATE, true);

      await expectAsync(
        readDestFile(twoDest)
      ).toBeResolvedTo(fileContents("two"));
    });
  })

  it("source content", async () => {
    const threeDest = path.join(tempDest, "three.ts");
    await overwriteFileIfDifferent(
      true,
      fileContents("three"),
      threeDest,
      CURRENT_DATE
    );

    await expectDestAccessAndModifiedDates(threeDest, CURRENT_DATE, true);

    await expectAsync(
      readDestFile(threeDest)
    ).toBeResolvedTo(fileContents("three"));
  });

  describe("overwrites the destination file when there is a mismatch against the source", () => {
    it("file", async () => {
      const fourDest = path.join(tempDest, "four.ts");
      await overwriteFileIfDifferent(
        false,
        path.join(tempSrc, "four.ts"),
        fourDest,
        CURRENT_DATE
      );

      await expectDestAccessAndModifiedDates(fourDest, DESTINATION_DATE, true);

      await expectAsync(
        readDestFile(fourDest)
      ).toBeResolvedTo(fileContents("four"));
    });

    it("contents", async () => {
      const fiveDest = path.join(tempDest, "five.ts");
      await overwriteFileIfDifferent(
        true,
        fileContents("five"),
        fiveDest,
        CURRENT_DATE
      );

      await expectDestAccessAndModifiedDates(fiveDest, DESTINATION_DATE, true);
    });
  });

  it("throws for a non-existent source file", async () => {
    await expectAsync(
      overwriteFileIfDifferent(
        false,
        path.join(tempSrc, "six.ts"),
        path.join(tempDest, "six.ts"),
        CURRENT_DATE
      )
    ).toBeRejected();
  });
});
