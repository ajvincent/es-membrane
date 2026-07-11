import {
  ProxyTrap,
  allTraps
} from "#objectgraph_handlers/source/sharedUtilities.js";

import {
  ClassMembersMap,
  type ClassDeclarationImpl,
  type MethodDeclarationImpl,
} from "ts-morph-structures";

export class MethodStacks {
  static readonly #trapsSet: ReadonlySet<ProxyTrap> = new Set(allTraps);
  static #getTrapName(
    method: MethodDeclarationImpl
  ): string
  {
    return !method.isStatic && this.#trapsSet.has(method.name as ProxyTrap) ? method.name : "";
  }

  readonly #methodStacks = new Map<string, (MethodDeclarationImpl | undefined)[]>;
  readonly methodStacks: ReadonlyMap<string, (MethodDeclarationImpl | undefined)[]> = this.#methodStacks;

  readonly #classes: ClassDeclarationImpl[] = [];
  readonly classes: readonly ClassDeclarationImpl[] = this.#classes;

  constructor() {
    Reflect.defineProperty(this, "methodStacks", { writable: false, configurable: false });
    Reflect.defineProperty(this, "classes", { writable: false, configurable: false });
  }

  public addClass(
    classDecl: ClassDeclarationImpl
  ): void
  {
    const trapToMethodMap = new Map<ProxyTrap, MethodDeclarationImpl | undefined>;

    for (const method of classDecl.methods) {
      const name: string = MethodStacks.#getTrapName(method);
      if (MethodStacks.#trapsSet.has(name as ProxyTrap)) {
        trapToMethodMap.set(name as ProxyTrap, method);
      } else {
        this.#methodStacks.getOrInsert(name, []).unshift(method);
      }
    }

    for (const trapName of MethodStacks.#trapsSet) {
      this.#methodStacks.getOrInsert(trapName, []).unshift(trapToMethodMap.get(trapName));
    }

    this.#classes.unshift(classDecl);
  }

  /**
   * Extract methods after a particular decorator and rename them, with a prefix of "#" (make private methods).
   * @param decoratorName
   * @param methodPostfix
   */
  public splitStacksAfter(
    decoratorName: string,
    methodPostfix: string
  ): void
  {
    void decoratorName;
    void methodPostfix;
    throw new Error("not yet implemented");
  }

  public getFlattenedClassMembers(): ClassMembersMap {
    throw new Error("not yet implemented");
  }
}
