import type {
  JSDocStructure,
} from "ts-morph";

import {
  JSDocImpl
} from "#stage_one/prototype-snapshot/exports.js";

interface JSDocData {
  isStructureDef: boolean;
  className: string;
  isStatic: boolean;
  fieldName: string;
}

type JSDocRequired = Required<Pick<JSDocStructure, "description" | "tags">>;

export default class JSDocMap {
  #hasher(data: JSDocData): string {
    const hash = JSON.stringify(data);
    if (!this.#hashToKeysMap.has(hash)) {
      this.#hashToKeysMap.set(hash, data);
    }
    return hash;
  }

  readonly #hashToDocMap = new Map<string, JSDocImpl | undefined | null>;
  readonly #hashToKeysMap = new Map<string, JSDocData>;
  readonly #decoratorClassNames = new Set<string>;
  readonly #structureClassNames = new Set<string>;

  addStructureFields(
    className: string,
    staticFields: Record<string, JSDocRequired>,
    instanceFields: Record<string, JSDocRequired>
  ): void
  {
    this.#structureClassNames.add(className);
    for (const [fieldName, doc] of Object.entries(staticFields)) {
      const hash = this.#hasher({isStructureDef: true, className, isStatic: true, fieldName});
      const impl = JSDocImpl.clone(doc);
      this.#hashToDocMap.set(hash, impl);
    }
    for (const [fieldName, doc] of Object.entries(instanceFields)) {
      const hash = this.#hasher({isStructureDef: true, className, isStatic: false, fieldName});
      const impl = JSDocImpl.clone(doc);
      this.#hashToDocMap.set(hash, impl);
    }
  }

  addDecoratorFields(
    className: string,
    staticFields: Record<string, JSDocRequired>,
    instanceFields: Record<string, JSDocRequired>
  ): void
  {
    this.#decoratorClassNames.add(className);
    for (const [fieldName, doc] of Object.entries(staticFields)) {
      const hash = this.#hasher({isStructureDef: false, className, isStatic: true, fieldName});
      const impl = JSDocImpl.clone(doc);
      this.#hashToDocMap.set(hash, impl);
    }
    for (const [fieldName, doc] of Object.entries(instanceFields)) {
      const hash = this.#hasher({isStructureDef: false, className, isStatic: false, fieldName});
      const impl = JSDocImpl.clone(doc);
      this.#hashToDocMap.set(hash, impl);
    }
  }

  requireFields(
    isStructureDef: boolean,
    className: string,
    staticFields: readonly string[],
    instanceFields: readonly string[]
  ): void {
    staticFields.forEach(fieldName => {
      const classMap = isStructureDef ? this.#structureClassNames : this.#decoratorClassNames;
      const hash = this.#hasher({isStructureDef, className, isStatic: true, fieldName});
      if (!classMap.has(className)) {
        this.#hashToDocMap.set(hash, undefined);
      }

      if (this.#hashToDocMap.has(hash))
        return;

      const starHash = this.#hasher({isStructureDef, className: "*", isStatic: true, fieldName});
      if (this.#hashToDocMap.has(starHash)) {
        this.#hashToDocMap.set(hash, this.#hashToDocMap.get(starHash));
        return;
      }

      this.#hashToDocMap.set(hash, null);
    });

    instanceFields.forEach(fieldName => {
      const classMap = isStructureDef ? this.#structureClassNames : this.#decoratorClassNames;
      const hash = this.#hasher({isStructureDef, className, isStatic: false, fieldName});
      if (!classMap.has(className)) {
        this.#hashToDocMap.set(hash, undefined);
      }

      if (this.#hashToDocMap.has(hash))
        return;

      const starHash = this.#hasher({isStructureDef, className: "*", isStatic: false, fieldName});
      if (this.#hashToDocMap.has(starHash)) {
        this.#hashToDocMap.set(hash, this.#hashToDocMap.get(starHash));
        return;
      }

      this.#hashToDocMap.set(hash, null);
    });
  }

  hasStructureClass(
    className: string,
  ): boolean
  {
    return this.#structureClassNames.has(className);
  }

  hasDecoratorClass(
    className: string
  ): boolean
  {
    return this.#decoratorClassNames.has(className);
  }

  getFieldDoc(
    isStructureDef: boolean,
    className: string,
    isStatic: boolean,
    fieldName: string,
  ): JSDocImpl | undefined | null
  {
    let hasClass = false;
    if (isStructureDef)
      hasClass = this.#structureClassNames.has(className);
    else
      hasClass = this.#decoratorClassNames.has(className);
    if (!hasClass)
      return undefined;

    const hash = this.#hasher({isStructureDef, className, isStatic, fieldName});
    const starHash = this.#hasher({isStructureDef, className: "*", isStatic, fieldName});
    return this.#hashToDocMap.get(hash) ?? this.#hashToDocMap.get(starHash);
  }

  toJSON(): Record<string, Record<string, JSDocImpl | "(missing group)" | null>>
  {
    const dict: Record<string, Record<string, JSDocImpl | "(missing group)" | null>> = {};
    this.#hashToDocMap.forEach((rawValue, hash) => {
      const key = this.#hashToKeysMap.get(hash)!;
      const topKey = `${key.isStructureDef ? "structure " : "decorator "}${key.className}`;
      dict[topKey] ??= {};
      const subKey = `${key.isStatic ? "static " : ""}${key.fieldName}`;
      const value: JSDocImpl | "(missing group)" | null = (rawValue === undefined) ? "(missing group)" : rawValue;
      dict[topKey][subKey] = value;
    });

    const entries = Object.entries(dict);
    entries.sort((a, b) => a[0].localeCompare(b[0]));
    return Object.fromEntries(entries);
  }
}