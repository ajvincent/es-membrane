import type {
  PushableArray
} from "./types/Utility.mjs";

import WeakRefSet from "./collections/WeakRefSet.js";

import type {
  SharedAssertFunction,
  SharedAssertionObserver,
} from "./types/assert.mjs"

export default class SharedAssertSet
{
  readonly #sharedAsserts = new WeakRefSet<SharedAssertTracker>;
  readonly #addFailureBound = this.#addFailure.bind(this);
  readonly #assertFailures: PushableArray<SharedAssertionError> = [];

  /**
   * @param sourceOfError - the source of the assertion failure.
   * @param error - the assertion failure we're about to throw for.
   */
  #addFailure(
    sourceOfError: SharedAssertTracker,
    error: SharedAssertionError
  ): void
  {
    this.#assertFailures.push(error);

    try {
      sourceOfError.observer.observeAssertFailed(true);
    }
    catch (ex) {
      // do nothing
    }
    for (const sharedAssert of this.#sharedAsserts.liveElements()) {
      if (sharedAssert === sourceOfError)
        continue;

      try {
        sharedAssert.observer.observeAssertFailed(false);
      }
      catch (ex) {
        // do nothing
      }
    }
  }

  /**
   * Create a SharedAssert object, and assign its assert() method into an observer.
   */
  buildShared(
    observer: SharedAssertionObserver
  ): SharedAssertTracker
  {
    if (this.hasAssertFailures())
      throw new Error("This shared assert set already has failures.  Why create another?");

    const rv = new SharedAssertTracker(this, this.#addFailureBound, observer);
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
export class SharedAssertTracker
{
  readonly #set: SharedAssertSet;
  readonly #ownAssertFailures: PushableArray<SharedAssertionError> = [];

  /** callback to notify the shared assert set of a failure. */
  readonly #addFailureToSet: (
    sourceOfError: SharedAssertTracker,
    error: SharedAssertionError
  ) => void;


  readonly observer: SharedAssertionObserver;

  /**

   * @param assertSet - the owning set for this object.
   * @param addFailureToSet - the private callback to notify the set of an assertion failure.
   * @param observer - the receiver for assertion failures, which gets our assert() method as a property.
   *
   * @internal
   */
  constructor(
    assertSet: SharedAssertSet,
    addFailureToSet: (sourceOfError: SharedAssertTracker, error: SharedAssertionError) => void,
    observer: SharedAssertionObserver
  )
  {
    this.#set = assertSet;
    this.#addFailureToSet = addFailureToSet;
    this.observer = observer;
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
  public reportFailure(message: string): never
  {
    const error = new SharedAssertionError(message, this.observer);
    this.#ownAssertFailures.push(error);
    this.#addFailureToSet(this, error);

    throw error;
  }
}

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
): asserts condition
{
  if (!condition)
    throw new Error(message);
}
unsharedAssert satisfies SharedAssertFunction;

export function sharedAssert(
  condition: boolean,
  message: string,
  owner: SharedAssertTracker
): asserts condition
{
  if (condition)
    return;

  owner.reportFailure(message);
}
