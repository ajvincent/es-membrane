import path from "node:path";
import { fileURLToPath } from "node:url";

import { projectDir } from "../../internal/AsyncSpecModules.js";

/**
 * @param {Record<string, string | null>} packageImports
 * @returns {ReadonlyMap<RegExp, string | null>}
 */
export function buildReplacementMap(packageImports) {
  const records = Object.entries(packageImports);

  return new Map(records.map(([privateImport, mapTarget]) => {
    mapTarget = buildReplacementTarget(mapTarget);
    const matchExpression = buildMatchExpression(privateImport);
    return [matchExpression, mapTarget];
  }));
}

/**
 * @param {string} privateImport
 * @returns {RegExp}
 */
function buildMatchExpression(privateImport) {
  privateImport = privateImport.replace(/\./g, "\\.").replace(/\*/g, "(.*)");
  return new RegExp(`^${privateImport}\$`);
}

/**
 * @param {string | null} mapTarget
 * @returns {string | null}
 */
function buildReplacementTarget(mapTarget) {
  let asteriskCount = 0;
  if (mapTarget !== null) {
    while (mapTarget.includes("*")) {
      mapTarget = mapTarget.replace("*", "$" + (++asteriskCount));
    }
  }
  return mapTarget;
}

/**
 *
 * @param {ReadonlyMap<RegExp, string | null>} replacementMap
 * @param {string} specifier
 * @param {string} parentURL
 *
 * @returns {string}
 */
export function getReplacement(replacementMap, specifier, parentURL) {
  /** @type {RegExp?} */
  let lastMatcher = null;
  for (const matcher of replacementMap.keys()) {
    if (matcher.test(specifier)) {
      lastMatcher = matcher;
    }
  }

  if (lastMatcher) {
    /** @type {string} */
    const replacementString = replacementMap.get(lastMatcher);
    const relativePath = specifier.replace(lastMatcher, replacementString);
    const absolutePath = path.normalize(path.join(projectDir, relativePath));

    specifier = path.relative(
      path.dirname(fileURLToPath(parentURL)), absolutePath
    );
    if (specifier.startsWith("../") === false)
      specifier = "./" + specifier;
  }

  return specifier;
}
