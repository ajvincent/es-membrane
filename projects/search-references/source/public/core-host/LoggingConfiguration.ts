import type {
  SearchConfiguration
} from "./types/SearchConfiguration.js";

export class LoggingConfiguration implements Required<SearchConfiguration>
{
  static #hashSpecifierAndKey(
    referenceSpec: string,
    resultsKey: string
  ): string
  {
    return referenceSpec + ": " + resultsKey;
  }

  readonly #logsMap = new Map<string, string[]>;
  #tracingHash: string = "";

  //#region SearchConfiguration
  noFunctionEnvironment = false;

  beginSearch(sourceSpecifier: string, resultsKey: string): void {
    void(sourceSpecifier);
    this.#tracingHash = LoggingConfiguration.#hashSpecifierAndKey(sourceSpecifier, resultsKey);
    this.log("enter " + this.#tracingHash, true);
  }

  endSearch(sourceSpecifier: string, resultsKey: string): void {
    void(sourceSpecifier);
    void(resultsKey);
    this.log("leave " + this.#tracingHash, true);
    this.#tracingHash = "";
  }

  internalErrorTrap(): void {
    // eslint-disable-next-line no-debugger
    debugger;
  }

  log(message: string, noIndent?: boolean): void {
    if (!noIndent)
      message = "  " + message;

    if (this.#logsMap.has(this.#tracingHash) === false) {
      this.#logsMap.set(this.#tracingHash, []);
    }
    this.#logsMap.get(this.#tracingHash)!.push(message);
  }

  defineNodeTrap(parentId: string, weakKey: string, details: string): void {
    this.log(`defineNode: parentId=${parentId} weakKeyId=${weakKey} ${details}`);
  }

  defineEdgeTrap(
    parentId: string,
    edgeId: string,
    childId: string,
    secondParentId: string | undefined,
    isStrongReference: boolean
  ): void
  {
    const secondIdPart = secondParentId ? " + " + secondParentId : "";
    this.log(
      `defineEdgeTrap: ${parentId}${secondIdPart} via ${edgeId} to ${childId}, isStrongReference: ${isStrongReference}`
    );
  }

  defineWeakKeyTrap(weakKey: string): void {
    this.log(`defineWeakKey: ${weakKey}`);
  }

  markStrongNodeTrap(nodeId: string): void {
    this.log("markStrongNode: " + nodeId);
  }
  //#endregion SearchConfiguration

  retrieveLogs(sourceSpecifier: string, resultsKey: string): readonly string[] | undefined {
    const tracingHash: string = LoggingConfiguration.#hashSpecifierAndKey(sourceSpecifier, resultsKey);
    return this.#logsMap.get(tracingHash);
  }
}
