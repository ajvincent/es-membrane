import type {
  PushableArray
} from "./types/Utility.mjs";

import WeakRefSet from "./WeakRefSet.mjs";

import type {
  AssertFunction,
  SharedAssertionObserver,
} from "./types/assert.mjs"

export default class SharedAssertSet
{
  readonly #sharedAsserts = new WeakRefSet<SharedAssert>;
  readonly #addFailureBound = this.#addFailure.bind(this);
  readonly #assertFailures: PushableArray<SharedAssertionError> = [];

  /**
   * @param sourceOfError - the source of the assertion failure.
   * @param error - the assertion failure we're about to throw for.
   */
  #addFailure(
    sourceOfError: SharedAssert,
    error: SharedAssertionError
  ): void
  {
    this.#assertFailures.push(error);

    sourceOfError.observer.observeAssertFailed(true);
    for (const sharedAssert of this.#sharedAsserts.liveElements()) {
      if (sharedAssert === sourceOfError)
        continue;

      sharedAssert.observer.observeAssertFailed(false);
    }
  }

  /**
   * Create a SharedAssert object, and assign its assert() method into an observer.
   */
  buildShared(
    observer: SharedAssertionObserver
  ): SharedAssert
  {
    if (this.hasAssertFailures())
      throw new Error("This shared assert set already has failures.  Why create another?");

    const rv = new SharedAssert(this, this.#addFailureBound, observer);
    this.#sharedAsserts.addReference(rv);
    return rv;
  }

  /** @internal */
  hasAssertFailures(): boolean
  {
    return Boolean(this.#assertFailures.length);
  }

  /** @internal */
  getAssertFailures(): readonly SharedAssertionError[]
  {
    return this.#assertFailures;
  }
}

/** Your main interface for tracking all assertions. */
class SharedAssert
{
  readonly #set: SharedAssertSet;
  readonly #ownAssertFailures: PushableArray<SharedAssertionError> = [];

  /** callback to notify the shared assert set of a failure. */
  readonly #addFailureToSet: (
    sourceOfError: SharedAssert,
    error: SharedAssertionError
  ) => void;


  readonly observer: SharedAssertionObserver

  /**

   * @param assertSet - the owning set for this object.
   * @param addFailureToSet - the private callback to notify the set of an assertion failure.
   * @param observer - the receiver for assertion failures, which gets our assert() method as a property.
   *
   * @internal
   */
  constructor(
    assertSet: SharedAssertSet,
    addFailureToSet: (sourceOfError: SharedAssert, error: SharedAssertionError) => void,
    observer: SharedAssertionObserver
  )
  {
    this.#set = assertSet;
    this.#addFailureToSet = addFailureToSet;
    this.observer = observer;
    this.observer.assert = this.assert.bind(this);
  }

  hasOwnFailures(): boolean
  {
    return Boolean(this.#ownAssertFailures.length);
  }

  getOwnFailures(): readonly SharedAssertionError[]
  {
    return this.#ownAssertFailures;
  }

  hasSharedFailures(): boolean
  {
    return this.#set.hasAssertFailures();
  }

  getSharedFailures(): readonly SharedAssertionError[]
  {
    return this.#set.getAssertFailures();
  }

  /**
   * @param condition - false for an assertion failure
   * @param message - the message to throw on an assertion failure
   *
   * @throws `SharedAssertionError` on an assertion failure.
   */
  public assert(condition: boolean, message: string): void
  {
    if (condition)
      return;

    const error = new SharedAssertionError(message, this.observer);
    this.#ownAssertFailures.push(error);
    this.#addFailureToSet(this, error);

    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
SharedAssert.prototype.assert satisfies AssertFunction;

export class SharedAssertionError extends Error
{
  /** The source of the failure. */
  readonly sourceObserver: SharedAssertionObserver;

  /** @internal */
  constructor(
    message: string,
    sourceObserver: SharedAssertionObserver
  )
  {
    super(message);
    this.sourceObserver = sourceObserver;
  }
}

/**
 * @param condition - false for an assertion failure
 * @param message - the message to throw on an assertion failure
 *
 * @throws on an assertion failure.
 */
export function unsharedAssert(
  condition: boolean,
  message: string
): void
{
  if (!condition)
    throw new Error(message);
}
unsharedAssert satisfies AssertFunction;
