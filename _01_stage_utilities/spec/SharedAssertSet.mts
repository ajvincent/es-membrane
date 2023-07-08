/* eslint-disable @typescript-eslint/unbound-method */
import SharedAssertSet, {
  SharedAssertionError,
  type SharedAssertionObserver,
} from "#stage_utilities/source/SharedAssertSet.mjs";

it("SharedAssertSet propagates assertion failures across several observers", () => {
  const assertSet = new SharedAssertSet;

  const firstAssertSpy = jasmine.createSpyObj<SharedAssertionObserver>("first", ["observeAssertFailed", "assert"]);
  const secondAssertSpy = jasmine.createSpyObj<SharedAssertionObserver>("second", ["observeAssertFailed", "assert"]);
  const thirdAssertSpy = jasmine.createSpyObj<SharedAssertionObserver>("third", ["observeAssertFailed", "assert"]);

  const firstSharedAssert = assertSet.buildShared(firstAssertSpy);
  const secondSharedAssert = assertSet.buildShared(secondAssertSpy);
  const thirdSharedAssert = assertSet.buildShared(thirdAssertSpy);

  expect(firstSharedAssert.getOwnFailures()).toEqual([]);
  expect(firstSharedAssert.getSharedFailures()).toEqual([]);
  expect(firstSharedAssert.hasOwnFailures()).toBe(false);
  expect(firstSharedAssert.hasSharedFailures()).toBe(false);
  expect(firstSharedAssert.observer).toBe(firstAssertSpy);

  // when an assert passes, do nothing

  thirdAssertSpy.assert(true, "everything is awesome");

  expect(firstSharedAssert.getOwnFailures()).toEqual([]);
  expect(firstSharedAssert.getSharedFailures()).toEqual([]);
  expect(firstSharedAssert.hasOwnFailures()).toBe(false);
  expect(firstSharedAssert.hasSharedFailures()).toBe(false);

  expect(secondSharedAssert.getOwnFailures()).toEqual([]);
  expect(secondSharedAssert.getSharedFailures()).toEqual([]);
  expect(secondSharedAssert.hasOwnFailures()).toBe(false);
  expect(secondSharedAssert.hasSharedFailures()).toBe(false);

  expect(thirdSharedAssert.getOwnFailures()).toEqual([]);
  expect(thirdSharedAssert.getSharedFailures()).toEqual([]);
  expect(thirdSharedAssert.hasOwnFailures()).toBe(false);
  expect(thirdSharedAssert.hasSharedFailures()).toBe(false);

  expect(firstAssertSpy.observeAssertFailed).toHaveBeenCalledTimes(0);
  expect(secondAssertSpy.observeAssertFailed).toHaveBeenCalledTimes(0);
  expect(thirdAssertSpy.observeAssertFailed).toHaveBeenCalledTimes(0);

  // SharedAssertionError throws for one assert failure, notifies many observers.

  let exception: SharedAssertionError | undefined;
  {
    try {
      secondAssertSpy.assert(false, "Houston, we have a problem");
    }
    catch (ex) {
      if (ex instanceof SharedAssertionError)
        exception = ex;
    }
  }
  expect(exception).toBeInstanceOf(SharedAssertionError);
  if (!exception)
    throw new Error("exception should have existed");

  expect(exception.sourceObserver).toBe(secondAssertSpy);

  expect(firstSharedAssert.getOwnFailures()).toEqual([]);
  expect(firstSharedAssert.getSharedFailures()).toEqual([exception]);
  expect(firstSharedAssert.hasOwnFailures()).toBe(false);
  expect(firstSharedAssert.hasSharedFailures()).toBe(true);

  expect(secondSharedAssert.getOwnFailures()).toEqual([exception]);
  expect(secondSharedAssert.getSharedFailures()).toEqual([exception]);
  expect(secondSharedAssert.hasOwnFailures()).toBe(true);
  expect(secondSharedAssert.hasSharedFailures()).toBe(true);

  expect(thirdSharedAssert.getOwnFailures()).toEqual([]);
  expect(thirdSharedAssert.getSharedFailures()).toEqual([exception]);
  expect(thirdSharedAssert.hasOwnFailures()).toBe(false);
  expect(thirdSharedAssert.hasSharedFailures()).toBe(true);

  expect(firstAssertSpy.observeAssertFailed).toHaveBeenCalledOnceWith(false);
  expect(secondAssertSpy.observeAssertFailed).toHaveBeenCalledOnceWith(true);
  expect(thirdAssertSpy.observeAssertFailed).toHaveBeenCalledOnceWith(false);

  expect(secondAssertSpy.observeAssertFailed).toHaveBeenCalledBefore(firstAssertSpy.observeAssertFailed);
  expect(secondAssertSpy.observeAssertFailed).toHaveBeenCalledBefore(thirdAssertSpy.observeAssertFailed);

  expect(
    () => assertSet.buildShared(firstAssertSpy)
  ).toThrowError("This shared assert set already has failures.  Why create another?");
});
