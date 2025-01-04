/**
 * @param condition - false for an assertion failure
 * @param message - the message to throw on an assertion failure
 *
 * @throws `SharedAssertionError` on an assertion failure.
 */
export type AssertFunction = (condition: boolean, message: string) => void;

export interface AssertInterface
{
  /**
   * @param condition - false for an assertion failure
   * @param message - the message to throw on an assertion failure
   *
   * @throws `SharedAssertionError` on an assertion failure.
   */
  assert: AssertFunction;
}

/**
 * When you want to assert, and when you want to know about assertion failures elsewhere.
 */
export interface SharedAssertionObserver extends AssertInterface
{
  /**
   * An assertion has failed.  I want to know about it.
   *
   * @param forSelf - true if I caused it.
   */
  observeAssertFailed(forSelf: boolean): void;
}
