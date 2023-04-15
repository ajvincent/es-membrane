/**
 * An utility type for declaring mixin class static and instance fields.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes}
 * @see {@link https://www.typescriptlang.org/docs/handbook/2/classes.html}
 */
export interface StaticAndInstance {
  /** The static fields of the class. */
  readonly staticFields: object;

  /** The instance fields of the class. */
  readonly instanceFields: object;
}
