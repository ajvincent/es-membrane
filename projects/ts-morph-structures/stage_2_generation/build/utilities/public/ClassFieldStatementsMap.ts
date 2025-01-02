import type {
  WriterFunction
} from "ts-morph";

import type {
  StatementStructureImpls
} from "#stage_one/prototype-snapshot/exports.js";

export type StatementsArray = (string | WriterFunction | StatementStructureImpls)[];
type keyPair = {fieldName: string, statementGroup: string};

/**
 * This is a map for specifying statements across several class members for a single class field.
 *
 * For example, a field may require statements for:
 * - defining a getter and/or a setter
 * - initializing in a constructor
 * - implementing a .toJSON() method
 *
 * The field name specifies which field the statements are about.
 * The statement group specifies where the statements go (what method, or an initializer).
 *
 * Special field keys:
 * ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL:
 *   These statements will appear at the head of the statement block.
 * ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN:
 *   These statements will appear at the tail of the statement block.
 *
 * Special statement group keys:
 * ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY:
 *   This represents an initializer for a property, or a value reference for a getter or setter.
 *   Field keys will have `get ` or `set ` stripped from them for this group key.
 *   Statement arrays for this group key should contain exactly one statement, and should be just a string.
 *
 * @example
 * ```typescript
 * map.set("foo", ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY, ['this.#foo.value']);
 * map.set("foo", "toJSON", ["rv.foo = this.foo;"]);
 * // ...
 * map.set(ClassFieldsStatementsMap.FIELD_HEAD_SUPER_CALL, "toJSON", ["const rv = super.toJSON();"]);
 * map.set(ClassFieldsStatementsMap.FIELD_TAIL_FINAL_RETURN, "toJSON", ["return rv;"]);
 *
 * Array.from(map.groupStatementsMap("toJSON")!.values())
 * // [["const rv = super.toJSON();"], ["rv.foo = this.foo;"], ["return rv;"]];
 * ```
 */
export default class ClassFieldStatementsMap
{
  static #normalizeKeys(fieldName: string, statementGroup: string): [string, string] {
    if (statementGroup === ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY) {
      fieldName = fieldName.replace(/\b[gs]et /, "");
    }
    return [fieldName, statementGroup];
  }

  static #hashKey(fieldName: string, statementGroup: string): string {
    return JSON.stringify({fieldName, statementGroup});
  }
  static #parseKey(key: string): keyPair {
    return JSON.parse(key) as keyPair;
  }

  /** A special field name for the start of a function. */
  public static readonly FIELD_HEAD_SUPER_CALL = "(super call)";
  /** A special field name for the end of a function. */
  public static readonly FIELD_TAIL_FINAL_RETURN = "(final return)";

  public static readonly GROUP_INITIALIZER_OR_PROPERTY = "(initializer or property reference)";

  /** A convenience sorting function for fields. */
  public static fieldComparator(
    a: string,
    b: string
  ): number
  {
    if ((a === this.FIELD_HEAD_SUPER_CALL) || (b === this.FIELD_TAIL_FINAL_RETURN))
      return -1;
    if ((a === this.FIELD_TAIL_FINAL_RETURN) || (b === this.FIELD_HEAD_SUPER_CALL))
      return +1;
    return a.localeCompare(b);
  }

  readonly #map = new Map<string, StatementsArray>;
  readonly #statementGroupMap = new Map<string, Map<string, StatementsArray>>;

  public constructor(
    iterable?: [string, string, StatementsArray][]
  )
  {
    if (iterable) {
      for (const [fieldName, statementGroup, statements] of iterable) {
        this.set(fieldName, statementGroup, statements);
      }
    }
  }

  /**
   * The number of elements in this collection.
   * @returns The element count.
   */
  public get size(): number
  {
    return this.#map.size;
  }

  /**
   * Clear the collection.
   */
  public clear(): void
  {
    this.#map.clear();
    this.#statementGroupMap.clear();
  }

  /**
   * Delete an element from the collection by the given key sequence.
   *
   * @param fieldName - The class field name for the statements.
   * @param statementGroup - The statement group owning the statements.
   * @returns True if we found the statements and deleted it.
   */
  public delete(fieldName: string, statementGroup: string): boolean
  {
    [fieldName, statementGroup] = ClassFieldStatementsMap.#normalizeKeys(fieldName, statementGroup);
    const rv = this.#map.delete(ClassFieldStatementsMap.#hashKey(fieldName, statementGroup));
    this.#statementGroupMap.get(statementGroup)?.delete(fieldName);
    return rv;
  }

  /**
   * Yield the key-statements tuples of the collection.
   */
  public * entries(): IterableIterator<[string, string, StatementsArray]>
  {
    const iterator = this.#map.entries();
    for (const [hashed, statements] of iterator) {
      const {fieldName, statementGroup} = ClassFieldStatementsMap.#parseKey(hashed);
      yield [fieldName, statementGroup, statements];
    }
  }

  /**
   * Iterate over the keys and statementss.
   * @param __callback__ - A function to invoke for each iteration.
   * @param __thisArg__ -  statements to use as this when executing callback.
   */
  public forEach(
    __callback__: (
      statements: StatementsArray,
      fieldName: string,
      statementGroup: string,
      __collection__: ClassFieldStatementsMap
    ) => void,
    __thisArg__?: unknown
  ): void
  {
    this.#map.forEach(
      (statements: StatementsArray, hashed: string) => {
        const {fieldName, statementGroup} = ClassFieldStatementsMap.#parseKey(hashed);
        __callback__.apply(__thisArg__, [statements, fieldName, statementGroup, this]);
      }
    );
  }

  /**
   * Get a statements for a key set.
   *
   * @param fieldName - The class field name for the statements.
   * @param statementGroup - The statement group owning the statements.
   * @returns The statements.  Undefined if it isn't in the collection.
   */
  public get(fieldName: string, statementGroup: string): StatementsArray | undefined
  {
    [fieldName, statementGroup] = ClassFieldStatementsMap.#normalizeKeys(fieldName, statementGroup);
    return this.#map.get(ClassFieldStatementsMap.#hashKey(fieldName, statementGroup));
  }

  /**
   * Report if the collection has a statements for a key set.
   *
   * @param fieldName - The class field name for the statements.
   * @param statementGroup - The statement group owning the statements.
   * @returns True if the key set refers to a statements in the collection.
   */
  public has(fieldName: string, statementGroup: string): boolean
  {
    [fieldName, statementGroup] = ClassFieldStatementsMap.#normalizeKeys(fieldName, statementGroup);
    return this.#map.has(ClassFieldStatementsMap.#hashKey(fieldName, statementGroup));
  }

  /**
   * Yield the key sets of the collection.
   */
  public * keys(): IterableIterator<[string, string]>
  {
    const iterator = this.#map.keys();
    for (const hashed of iterator) {
      const {fieldName, statementGroup} = ClassFieldStatementsMap.#parseKey(hashed);
      yield [fieldName, statementGroup];
    }
  }

  /**
   * Set a statements for a key set.
   *
   * @param fieldName - The class field name for the statements.
   * @param statementGroup - The statement group owning the statements.
   * @param statements - The statements.
   * @returns This collection.
   */
  public set(fieldName: string, statementGroup: string, statements: StatementsArray): this
  {
    [fieldName, statementGroup] = ClassFieldStatementsMap.#normalizeKeys(fieldName, statementGroup);
    this.#map.set(
      ClassFieldStatementsMap.#hashKey(fieldName, statementGroup), statements
    );

    let subMap = this.#statementGroupMap.get(statementGroup);
    if (!subMap) {
      subMap = new Map<string, StatementsArray>;
      this.#statementGroupMap.set(statementGroup, subMap);
    }
    subMap.set(fieldName, statements);

    return this;
  }

  /**
   * Yield the statementss of the collection.
   */
  public values(): IterableIterator<StatementsArray>
  {
    return this.#map.values();
  }

  public [Symbol.iterator](): IterableIterator<[string, string, StatementsArray]>
  {
    return this.entries();
  }

  public [Symbol.toStringTag] = "ClassFieldStatementsMap";

  public groupKeys(): string[]
  {
    return Array.from(this.#statementGroupMap.keys());
  }

  /**
   * Get the current set of statements for each statement group, sorted by field name.
   * @param statementGroup - The statement group owning the statements.
   */
  public groupStatementsMap(
    statementGroup: string
  ): ReadonlyMap<string, StatementsArray> | undefined
  {
    const iterator = this.#statementGroupMap.get(statementGroup)?.entries();
    if (!iterator)
      return undefined;

    const entries = Array.from(iterator);
    entries.sort((a, b) => ClassFieldStatementsMap.fieldComparator(a[0], b[0]));
    return new Map(entries);
  }
}
