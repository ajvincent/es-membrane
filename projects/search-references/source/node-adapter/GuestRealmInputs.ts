import fs from "node:fs";

import {
  pathToFileURL,
  fileURLToPath,
} from "node:url";

import {
  resolve as ImportMetaResolve,
} from 'import-meta-resolve';
import type {
  GuestRealmInputsWithBuiltins
} from "../engine262-tools/types/Virtualization262.js";
import type {
  GuestEngine
} from "../engine262-tools/host-to-guest/GuestEngine.js";

export class NodeGuestRealmInputs implements GuestRealmInputsWithBuiltins {
  readonly startingSpecifier: string;
  readonly defineBuiltIns?: ((realm: GuestEngine.ManagedRealm) => GuestEngine.Evaluator<void>) | undefined;

  constructor(
    absolutePathToFile: string,
    defineBuiltIns?: ((realm: GuestEngine.ManagedRealm) => GuestEngine.Evaluator<void>) | undefined
  )
  {
    this.startingSpecifier = pathToFileURL(absolutePathToFile).href;
    this.defineBuiltIns = defineBuiltIns;
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
