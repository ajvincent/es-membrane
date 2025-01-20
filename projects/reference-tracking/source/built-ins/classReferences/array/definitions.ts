/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  Class
} from "type-fest";

import {
  arrayOrderingLost,
  callArrayReferenceMethod,
  createCloneAndUseForRefs,
  noReferenceChangesToThis,
  unresolvable,
} from "./methodDecorators.js";

const BuiltInClassReferences: ReadonlyMap<string, Class<object>> = new Map<string, Class<object>>([

  ["Array", class<T> implements Array<T> {
    [n: number]: T;
    get length(): number {
      throw new Error("Getter not implemented");
    }

    @noReferenceChangesToThis
    toString(): string {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    toLocaleString(locales?: unknown, options?: unknown): string {
      throw new Error("Method not implemented.");
    }

    @callArrayReferenceMethod("pop")
    pop(): T | undefined {
      throw new Error("Method not implemented.");
    }

    @callArrayReferenceMethod("push")
    push(...items: T[]): number {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    @createCloneAndUseForRefs
    @callArrayReferenceMethod("push")
    concat(...items: unknown[]): T[] {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    join(separator?: string): string {
      throw new Error("Method not implemented.");
    }

    @callArrayReferenceMethod("reverse")
    reverse(): T[] {
      throw new Error("Method not implemented.");
    }

    @callArrayReferenceMethod("shift")
    shift(): T | undefined {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    @createCloneAndUseForRefs
    slice(start?: number, end?: number): T[] {
      throw new Error("Method not implemented.");
    }

    @unresolvable
    @arrayOrderingLost
    /*
    Explanation: Arrays are unique among the collections in that the have an order to them, and that more than one key may point to a value.
    Operations such as splice() alter the ordering in predictable ways.

    Sort doesn't do that.  After you sort, elements can appear anywhere among the indexed keys.

    The @unresolvable and @arrayOrderingLost tags are for this.  Maybe I can provide an UniqueElementsArray proxy or a SortedArray class to reduce the
    damage, but for now sort() should be considered fatal.  Likewise, I might provide a decorator to indicate the operation is safe.

    Other optioons include a defensive "ReadonlyComparator" type, (this: ReadonlyDeep<this>, a: ReadonlyDeep<T>, b: ReadonlyDeep<T>) => number.

    Generally speaking though, we want to frown on raw arrays being used.
    */
    @callArrayReferenceMethod("sort")
    sort(compareFn?: ((a: T, b: T) => number) | undefined): this {
      throw new Error("Method not implemented.");
    }

    @callArrayReferenceMethod("splice")
    splice(start: unknown, deleteCount?: unknown, ...rest: unknown[]): T[] {
      throw new Error("Method not implemented.");
    }

    @callArrayReferenceMethod("unshift")
    unshift(...items: T[]): number {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    indexOf(searchElement: T, fromIndex?: number): number {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    lastIndexOf(searchElement: T, fromIndex?: number): number {
      throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    every<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): this is S[]

    @noReferenceChangesToThis
    @callArrayReferenceMethod("every")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    every(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean
    {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    @callArrayReferenceMethod("some")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    some(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    @callArrayReferenceMethod("forEach")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    @callArrayReferenceMethod("map")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[] {
      throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter<S extends T>(predicate: (value: T, index: number, array: readonly T[]) => value is S, thisArg?: any): S[]

    @noReferenceChangesToThis
    @createCloneAndUseForRefs
    @callArrayReferenceMethod("filter")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter(predicate: (value: T, index: number, array: readonly T[]) => unknown, thisArg?: any): T[]
    {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    @createCloneAndUseForRefs
    @callArrayReferenceMethod("reduce")
    reduce<U>(callbackfn: unknown, initialValue?: unknown): T | U {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    @createCloneAndUseForRefs
    @callArrayReferenceMethod("reduceRight")
    reduceRight<U>(callbackfn: unknown, initialValue?: unknown): T | U {
      throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    find<S extends T>(predicate: (value: T, index: number, obj: T[]) => value is S, thisArg?: any): S | undefined

    @noReferenceChangesToThis
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    find(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): T | undefined
    {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number {
      throw new Error("Method not implemented.");
    }

    @unresolvable /* I'm just not familiar with the fill method right now.*/
    fill(value: T, start?: number, end?: number): this {
      throw new Error("Method not implemented.");
    }

    @unresolvable /* I'm not familiar with copyAction, either. */
    copyWithin(target: number, start: number, end?: number): this {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    entries(): ArrayIterator<[number, T]> {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    keys(): ArrayIterator<number> {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    values(): ArrayIterator<T> {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    includes(searchElement: T, fromIndex?: number): boolean {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    @callArrayReferenceMethod("flatMap")
    flatMap<U, This = undefined>(callback: (this: This, value: T, index: number, array: T[]) => U | readonly U[], thisArg?: This | undefined): U[] {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    @createCloneAndUseForRefs
    @callArrayReferenceMethod("flat")
    flat<A, D extends number = 1>(this: A, depth?: D | undefined): FlatArray<A, D>[] {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    at(index: number): T | undefined {
      throw new Error("Method not implemented.");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findLast<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S | undefined

    @noReferenceChangesToThis
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findLast(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T | undefined
    {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findLastIndex(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): number {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    @createCloneAndUseForRefs
    toReversed(): T[] {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    @createCloneAndUseForRefs
    @unresolvable
    @arrayOrderingLost
    @callArrayReferenceMethod("sort")
    toSorted(compareFn?: ((a: T, b: T) => number) | undefined): T[] {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    @createCloneAndUseForRefs
    @callArrayReferenceMethod("splice")
    toSpliced(start: unknown, deleteCount?: unknown, ...items: unknown[]): T[] {
      throw new Error("Method not implemented.");
    }

    @unresolvable /* I'm not familiar with the `with` method */
    with(index: number, value: T): T[] {
      throw new Error("Method not implemented.");
    }

    @noReferenceChangesToThis
    [Symbol.iterator](): ArrayIterator<T> {
      throw new Error("Method not implemented.");
    }
    get [Symbol.unscopables](): { [x: number]: boolean | undefined; length?: boolean | undefined; toString?: boolean | undefined; toLocaleString?: boolean | undefined; pop?: boolean | undefined; push?: boolean | undefined; concat?: boolean | undefined; join?: boolean | undefined; reverse?: boolean | undefined; shift?: boolean | undefined; slice?: boolean | undefined; sort?: boolean | undefined; splice?: boolean | undefined; unshift?: boolean | undefined; indexOf?: boolean | undefined; lastIndexOf?: boolean | undefined; every?: boolean | undefined; some?: boolean | undefined; forEach?: boolean | undefined; map?: boolean | undefined; filter?: boolean | undefined; reduce?: boolean | undefined; reduceRight?: boolean | undefined; find?: boolean | undefined; findIndex?: boolean | undefined; fill?: boolean | undefined; copyWithin?: boolean | undefined; entries?: boolean | undefined; keys?: boolean | undefined; values?: boolean | undefined; includes?: boolean | undefined; flatMap?: boolean | undefined; flat?: boolean | undefined; at?: boolean | undefined; findLast?: boolean | undefined; findLastIndex?: boolean | undefined; toReversed?: boolean | undefined; toSorted?: boolean | undefined; toSpliced?: boolean | undefined; with?: boolean | undefined;[Symbol.iterator]?: boolean | undefined; readonly [Symbol.unscopables]?: boolean | undefined; } {
      throw new Error("Getter not implemented.");
    }
  }],
]);
void(BuiltInClassReferences);
