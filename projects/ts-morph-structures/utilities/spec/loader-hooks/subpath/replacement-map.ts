import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  projectDir,
} from "../../../source/AsyncSpecModules.js";

import {
  buildReplacementMap,
  getReplacement,
} from "../../../loader-hooks/subpath/replacement-map.js";

describe("Subpath imports: ", () => {
  const importsRecords: Record<string, string | null> = {
    "#utilities/*/bar/*.js": "./custom_utilities/*/myBar/*.js",
    "#utilities/*/bar/deleted/*.js": null,
    "#other/*": "./other-files/*",
    "#relativeTest/*": "./relative-files-test/*",
  };

  it("buildReplacementMap works", () => {
    const importsMap: ReadonlyMap<RegExp, string | null> = buildReplacementMap(importsRecords);
    expect(importsMap.size).toBe(4);

    const [firstRegExp, firstReplacement]: [RegExp, string | null] = Array.from(importsMap.entries())[0];
    expect(firstRegExp.toString()).toEqual("/^#utilities\\/(.*)\\/bar\\/(.*)\\.js$/");
    expect(firstReplacement).toEqual("./custom_utilities/$1/myBar/$2.js");

    expect(firstRegExp.test("#utilities/foo/bar/baz.js")).toBeTrue();
    expect(
      "#utilities/foo/bar/baz.js".replace(firstRegExp, firstReplacement!)
    ).toEqual("./custom_utilities/foo/myBar/baz.js");
  });

  it("getReplacement gives reasonable answers", () => {
    const importsMap: ReadonlyMap<RegExp, string | null> = buildReplacementMap(importsRecords);

    const parentURL: string = pathToFileURL(
      path.join(projectDir, "files/to/load.ts")
    ).href;

    const relativeTestStart: string = pathToFileURL(
      path.join(projectDir, "relative-files-test/foo/start.ts")
    ).href;

    expect<string>(
      getReplacement(importsMap, "#utilities/foo/bar/baz.js", parentURL)
    ).toBe(
      "../../custom_utilities/foo/myBar/baz.js"
    );

    expect<string>(
      getReplacement(importsMap, "#utilities/bar/deleted/goaway.js", parentURL)
    ).toBe("#utilities/bar/deleted/goaway.js");

    expect<string>(
      getReplacement(importsMap, "#other/foo/bar.js", parentURL)
    ).toBe(
      "../../other-files/foo/bar.js"
    );

    expect<string>(
      getReplacement(importsMap, "#relativeTest/foo/sibling.js", relativeTestStart)
    ).toBe("./sibling.js");

    expect<string>(
      getReplacement(importsMap, "#relativeTest/bar/sibling.js", relativeTestStart)
    ).toBe("../bar/sibling.js");

    expect<string>(
      getReplacement(importsMap, "#relativeTest/foo/child/file.js", relativeTestStart)
    ).toBe("./child/file.js");
  });
});
