import fs from "node:fs";

import {
  pathToFileURL,
  fileURLToPath,
} from "node:url";

import {
  resolve as ImportMetaResolve,
} from 'import-meta-resolve';

import type {
  SearchGraph
} from "../../graph-analysis/types/SearchGraph.js";

import type {
  GuestRealmInputs,
} from "../core-host/types/Virtualization262.js";

import {
  LoggingConfiguration,
  runSearchesInGuestEngine as runSearches,
  type SearchConfiguration,
} from "../core-host/runSearchesInGuestEngine.js";

export {
  LoggingConfiguration,
  type SearchConfiguration,
};

export async function runSearchesInGuestEngine(
  absolutePathToFile: string,
  searchConfiguration?: SearchConfiguration,
): Promise<ReadonlyMap<string, SearchGraph | null>>
{
  const realmInputs = new NodeGuestRealmInputs(absolutePathToFile);
  return runSearches(realmInputs, searchConfiguration);
}

class NodeGuestRealmInputs implements GuestRealmInputs {
  readonly startingSpecifier: string;

  constructor(
    absolutePathToFile: string,
  )
  {
    this.startingSpecifier = pathToFileURL(absolutePathToFile).href;
  }

  public contentsGetter(
    resolvedSpecifier: string
  ): string
  {
    const absolutePathToFile = fileURLToPath(resolvedSpecifier);
    const contents = fs.readFileSync(absolutePathToFile, { "encoding": "utf-8" });
    return contents;
  }

  public resolveSpecifier(
    targetSpecifier: string,
    sourceSpecifier: string
  ): string
  {
    return ImportMetaResolve(targetSpecifier, sourceSpecifier);
  }
}
