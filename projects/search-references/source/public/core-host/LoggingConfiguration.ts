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
    return JSON.stringify({referenceSpec, resultsKey});
  }

  readonly #logsMap = new Map<string, string[]>;
  #currentSpecifier: string = "";
  #tracingHash: string = "";

  //#region SearchConfiguration
  noFunctionEnvironment = false;

  beginSearch(sourceSpecifier: string, resultsKey: string): void {
    this.#currentSpecifier = sourceSpecifier;
    this.#tracingHash = LoggingConfiguration.#hashSpecifierAndKey(sourceSpecifier, resultsKey);
    this.log("enter " + this.#tracingHash, 0);
  }

  endSearch(sourceSpecifier: string, resultsKey: string): void {
    void(sourceSpecifier);
    void(resultsKey);
    this.log("leave " + this.#tracingHash, 0);
    this.#tracingHash = "";
    this.#currentSpecifier = "";
  }

  internalErrorTrap(): void {
    // eslint-disable-next-line no-debugger
    debugger;
  }

  log(message: string, indentLevel = 2): void {
    message = "  ".repeat(indentLevel) + message;

    if (this.#logsMap.has(this.#tracingHash) === false) {
      this.#logsMap.set(this.#tracingHash, []);
    }
    this.#logsMap.get(this.#tracingHash)!.push(message);
  }

  printToScriptLog(message: string): void {
    if (this.#logsMap.has(this.#currentSpecifier) === false) {
      this.#logsMap.set(this.#currentSpecifier, []);
    }
    this.#logsMap.get(this.#currentSpecifier)!.push(message);
  }

  enterNodeIdTrap(nodeId: string): void {
    this.log("enter search nodeId: " + nodeId, 1);
  }

  leaveNodeIdTrap(nodeId: string): void {
    this.log("leave search nodeId: " + nodeId, 1);
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

  public retrieveLogs(
    sourceSpecifier: string,
    resultsKey: string
  ): (readonly string[]) | undefined
  {
    const tracingHash: string = LoggingConfiguration.#hashSpecifierAndKey(sourceSpecifier, resultsKey);
    return this.#logsMap.get(tracingHash);
  }

  public retrieveScriptLog(
    sourceSpecifier: string
  ): (readonly string[]) | undefined
  {
    return this.#logsMap.get(sourceSpecifier);
  }
}
