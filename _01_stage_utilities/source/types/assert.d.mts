/**
 * @param condition - false for an assertion failure
 * @param message - the message to throw on an assertion failure
 * @param owner - the object to notify when an assert fails
 *
 * @throws `SharedAssertionError` on an assertion failure.
 */
export type SharedAssertFunction = (condition: boolean, message: string, owner: SharedAssertionObserver) => asserts condition;

/**
 * When you want to assert, and when you want to know about assertion failures elsewhere.
 */
export interface SharedAssertionObserver
{
  /**
   * An assertion has failed.  I want to know about it.
   *
   * @param forSelf - true if I caused it.
   */
  observeAssertFailed(forSelf: boolean): void;
}
