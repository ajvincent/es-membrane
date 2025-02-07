import {
  FLUSH_CELLS_OF_HELD_VALUE,
  FinalizationRegistryTracking,
 } from "../../../source/mockups/FinalizationRegistry.js";

 import {
  COLLECT_REFERENCES
} from "../../../source/mockups/utilities/ReferenceDescription.js";

it("FinalizationRegistryTracking extends FinalizationRegistry with [COLLECT_REFERENCES]", () => {
  const cleanupCallback = jasmine.createSpy();
  const UniqueKey = Symbol("unique key");

  class Target {
    readonly [UniqueKey] = "target";
  }

  class HeldValue {
    readonly [UniqueKey] = "held value";
  }

  class Token {
    readonly [UniqueKey] = "unregistration Token";
  }

  class Registration {
    target = new Target;
    heldValue = new HeldValue;
    token? = new Token;
  }

  let registry: FinalizationRegistryTracking<HeldValue> | undefined = new FinalizationRegistryTracking<HeldValue>(cleanupCallback);
  const firstRegistered = new Registration;
  registry.register(firstRegistered.target, firstRegistered.heldValue, firstRegistered.token);
  //const secondRegistered = new Registration(registry);

  {
    const refs = registry[COLLECT_REFERENCES]();
    expect(refs.length).toBe(3);
    if (refs.length === 3) {
      const [cleanupRef, ref0, ref1] = refs;
      expect(cleanupRef.collectionName).toBe("FinalizationRegistry");
      expect(cleanupRef.jointOwners.size).toBe(1);
      expect(cleanupRef.jointOwners.has(registry)).toBeTrue();
      expect(cleanupRef.referencedValue).toBe(cleanupCallback);
      expect(cleanupRef.isStrongReference).toBe(true);
      expect(cleanupRef.contextPrimitives).toEqual(["[[CleanupCallback]]"]);

      expect(ref0.collectionName).toBe("FinalizationRegistry");
      expect(ref0.jointOwners.size).toBe(2);
      expect(ref0.jointOwners.has(registry)).toBeTrue();
      expect(ref0.jointOwners.has(firstRegistered.target)).toBeTrue();
      expect(ref0.referencedValue).toBe(firstRegistered.heldValue);
      expect(ref0.isStrongReference).toBeTrue();
      expect(ref0.contextPrimitives).toEqual(["heldValue"]);

      expect(ref1.collectionName).toBe("FinalizationRegistry");
      expect(ref1.jointOwners.size).toBe(2);
      expect(ref1.jointOwners.has(registry)).toBeTrue();
      expect(ref1.jointOwners.has(firstRegistered.target)).toBeTrue();
      expect(ref1.referencedValue).toBe(firstRegistered.token!);
      expect(ref1.isStrongReference).toBeFalse();
      expect(ref1.contextPrimitives).toEqual(["unregisterToken"]);
    }
  }

  const sharedHeldValue = new Registration;
  sharedHeldValue.heldValue = firstRegistered.heldValue;
  registry.register(sharedHeldValue.target, sharedHeldValue.heldValue, sharedHeldValue.token);

  {
    const refs = registry[COLLECT_REFERENCES]();
    expect(refs.length).toBe(5);
    if (refs.length === 5) {
      // #region same tests as above
      const [cleanupRef, ref0, ref1, ref2, ref3] = refs;
      expect(cleanupRef.collectionName).toBe("FinalizationRegistry");
      expect(cleanupRef.jointOwners.size).toBe(1);
      expect(cleanupRef.jointOwners.has(registry)).toBeTrue();
      expect(cleanupRef.referencedValue).toBe(cleanupCallback);
      expect(cleanupRef.isStrongReference).toBe(true);
      expect(cleanupRef.contextPrimitives).toEqual(["[[CleanupCallback]]"]);

      expect(ref0.collectionName).toBe("FinalizationRegistry");
      expect(ref0.jointOwners.size).toBe(2);
      expect(ref0.jointOwners.has(registry)).toBeTrue();
      expect(ref0.jointOwners.has(firstRegistered.target)).toBeTrue();
      expect(ref0.referencedValue).toBe(firstRegistered.heldValue);
      expect(ref0.isStrongReference).toBeTrue();
      expect(ref0.contextPrimitives).toEqual(["heldValue"]);

      expect(ref1.collectionName).toBe("FinalizationRegistry");
      expect(ref1.jointOwners.size).toBe(2);
      expect(ref1.jointOwners.has(registry)).toBeTrue();
      expect(ref1.jointOwners.has(firstRegistered.target)).toBeTrue();
      expect(ref1.referencedValue).toBe(firstRegistered.token!);
      expect(ref1.isStrongReference).toBeFalse();
      expect(ref1.contextPrimitives).toEqual(["unregisterToken"]);
      // #endregion same tests as above

      expect(ref2.collectionName).toBe("FinalizationRegistry");
      expect(ref2.jointOwners.size).toBe(2);
      expect(ref2.jointOwners.has(registry)).toBeTrue();
      expect(ref2.jointOwners.has(sharedHeldValue.target)).toBeTrue();
      expect(ref2.referencedValue).toBe(sharedHeldValue.heldValue);
      expect(ref2.isStrongReference).toBeTrue();
      expect(ref2.contextPrimitives).toEqual(["heldValue"]);

      expect(ref3.collectionName).toBe("FinalizationRegistry");
      expect(ref3.jointOwners.size).toBe(2);
      expect(ref3.jointOwners.has(registry)).toBeTrue();
      expect(ref3.jointOwners.has(sharedHeldValue.target)).toBeTrue();
      expect(ref3.referencedValue).toBe(sharedHeldValue.token!);
      expect(ref3.isStrongReference).toBeFalse();
      expect(ref3.contextPrimitives).toEqual(["unregisterToken"]);
    }
  }

  // testimg unregisterToken with a value that isn't a token
  registry.unregister(sharedHeldValue.target);
  //#region same tests as above... yes I know this borders on ridiculous
  {
    const refs = registry[COLLECT_REFERENCES]();
    expect(refs.length).toBe(5);
    if (refs.length === 5) {
      const [cleanupRef, ref0, ref1, ref2, ref3] = refs;
      expect(cleanupRef.collectionName).toBe("FinalizationRegistry");
      expect(cleanupRef.jointOwners.size).toBe(1);
      expect(cleanupRef.jointOwners.has(registry)).toBeTrue();
      expect(cleanupRef.referencedValue).toBe(cleanupCallback);
      expect(cleanupRef.isStrongReference).toBe(true);
      expect(cleanupRef.contextPrimitives).toEqual(["[[CleanupCallback]]"]);

      expect(ref0.collectionName).toBe("FinalizationRegistry");
      expect(ref0.jointOwners.size).toBe(2);
      expect(ref0.jointOwners.has(registry)).toBeTrue();
      expect(ref0.jointOwners.has(firstRegistered.target)).toBeTrue();
      expect(ref0.referencedValue).toBe(firstRegistered.heldValue);
      expect(ref0.isStrongReference).toBeTrue();
      expect(ref0.contextPrimitives).toEqual(["heldValue"]);

      expect(ref1.collectionName).toBe("FinalizationRegistry");
      expect(ref1.jointOwners.size).toBe(2);
      expect(ref1.jointOwners.has(registry)).toBeTrue();
      expect(ref1.jointOwners.has(firstRegistered.target)).toBeTrue();
      expect(ref1.referencedValue).toBe(firstRegistered.token!);
      expect(ref1.isStrongReference).toBeFalse();
      expect(ref1.contextPrimitives).toEqual(["unregisterToken"]);

      expect(ref2.collectionName).toBe("FinalizationRegistry");
      expect(ref2.jointOwners.size).toBe(2);
      expect(ref2.jointOwners.has(registry)).toBeTrue();
      expect(ref2.jointOwners.has(sharedHeldValue.target)).toBeTrue();
      expect(ref2.referencedValue).toBe(sharedHeldValue.heldValue);
      expect(ref2.isStrongReference).toBeTrue();
      expect(ref2.contextPrimitives).toEqual(["heldValue"]);

      expect(ref3.collectionName).toBe("FinalizationRegistry");
      expect(ref3.jointOwners.size).toBe(2);
      expect(ref3.jointOwners.has(registry)).toBeTrue();
      expect(ref3.jointOwners.has(sharedHeldValue.target)).toBeTrue();
      expect(ref3.referencedValue).toBe(sharedHeldValue.token!);
      expect(ref3.isStrongReference).toBeFalse();
      expect(ref3.contextPrimitives).toEqual(["unregisterToken"]);
    }
  }
  //#endregion same tests as above

  registry.unregister(sharedHeldValue.token!);
  //#region same tests as original
  {
    const refs = registry[COLLECT_REFERENCES]();
    expect(refs.length).toBe(3);
    if (refs.length === 3) {
      const [cleanupRef, ref0, ref1] = refs;
      expect(cleanupRef.collectionName).toBe("FinalizationRegistry");
      expect(cleanupRef.jointOwners.size).toBe(1);
      expect(cleanupRef.jointOwners.has(registry)).toBeTrue();
      expect(cleanupRef.referencedValue).toBe(cleanupCallback);
      expect(cleanupRef.isStrongReference).toBe(true);
      expect(cleanupRef.contextPrimitives).toEqual(["[[CleanupCallback]]"]);

      expect(ref0.collectionName).toBe("FinalizationRegistry");
      expect(ref0.jointOwners.size).toBe(2);
      expect(ref0.jointOwners.has(registry)).toBeTrue();
      expect(ref0.jointOwners.has(firstRegistered.target)).toBeTrue();
      expect(ref0.referencedValue).toBe(firstRegistered.heldValue);
      expect(ref0.isStrongReference).toBeTrue();
      expect(ref0.contextPrimitives).toEqual(["heldValue"]);

      expect(ref1.collectionName).toBe("FinalizationRegistry");
      expect(ref1.jointOwners.size).toBe(2);
      expect(ref1.jointOwners.has(registry)).toBeTrue();
      expect(ref1.jointOwners.has(firstRegistered.target)).toBeTrue();
      expect(ref1.referencedValue).toBe(firstRegistered.token!);
      expect(ref1.isStrongReference).toBeFalse();
      expect(ref1.contextPrimitives).toEqual(["unregisterToken"]);
    }
  }
  //#endregion same tests as original

  const noToken = new Registration;
  noToken.token = undefined;
  registry.register(noToken.target, noToken.heldValue);
  {
    const refs = registry[COLLECT_REFERENCES]();
    expect(refs.length).toBe(4);
    if (refs.length === 4) {
      // #region same tests as above
      const [cleanupRef, ref0, ref1, noTokenRef] = refs;
      expect(cleanupRef.collectionName).toBe("FinalizationRegistry");
      expect(cleanupRef.jointOwners.size).toBe(1);
      expect(cleanupRef.jointOwners.has(registry)).toBeTrue();
      expect(cleanupRef.referencedValue).toBe(cleanupCallback);
      expect(cleanupRef.isStrongReference).toBe(true);
      expect(cleanupRef.contextPrimitives).toEqual(["[[CleanupCallback]]"]);

      expect(ref0.collectionName).toBe("FinalizationRegistry");
      expect(ref0.jointOwners.size).toBe(2);
      expect(ref0.jointOwners.has(registry)).toBeTrue();
      expect(ref0.jointOwners.has(firstRegistered.target)).toBeTrue();
      expect(ref0.referencedValue).toBe(firstRegistered.heldValue);
      expect(ref0.isStrongReference).toBeTrue();
      expect(ref0.contextPrimitives).toEqual(["heldValue"]);

      expect(ref1.collectionName).toBe("FinalizationRegistry");
      expect(ref1.jointOwners.size).toBe(2);
      expect(ref1.jointOwners.has(registry)).toBeTrue();
      expect(ref1.jointOwners.has(firstRegistered.target)).toBeTrue();
      expect(ref1.referencedValue).toBe(firstRegistered.token!);
      expect(ref1.isStrongReference).toBeFalse();
      expect(ref1.contextPrimitives).toEqual(["unregisterToken"]);
      // #endregion same tests as above

      expect(noTokenRef.collectionName).toBe("FinalizationRegistry");
      expect(noTokenRef.jointOwners.size).toBe(2);
      expect(noTokenRef.jointOwners.has(registry)).toBeTrue();
      expect(noTokenRef.jointOwners.has(noToken.target)).toBeTrue();
      expect(noTokenRef.referencedValue).toBe(noToken.heldValue);
      expect(noTokenRef.isStrongReference).toBeTrue();
      expect(noTokenRef.contextPrimitives).toEqual(["heldValue"]);
    }
  }

  // sharing an unregister token
  const sharedToken = new Registration;
  sharedToken.token = firstRegistered.token;
  registry.register(sharedToken.target, sharedToken.heldValue, sharedToken.token);
  registry.unregister(sharedToken.token!);
  {
    const refs = registry[COLLECT_REFERENCES]();
    expect(refs.length).toBe(2);
    if (refs.length === 2) {
      const [cleanupRef, noTokenRef] = refs;
      expect(cleanupRef.collectionName).toBe("FinalizationRegistry");
      expect(cleanupRef.jointOwners.size).toBe(1);
      expect(cleanupRef.jointOwners.has(registry)).toBeTrue();
      expect(cleanupRef.referencedValue).toBe(cleanupCallback);
      expect(cleanupRef.isStrongReference).toBe(true);
      expect(cleanupRef.contextPrimitives).toEqual(["[[CleanupCallback]]"]);

      expect(noTokenRef.collectionName).toBe("FinalizationRegistry");
      expect(noTokenRef.jointOwners.size).toBe(2);
      expect(noTokenRef.jointOwners.has(registry)).toBeTrue();
      expect(noTokenRef.jointOwners.has(noToken.target)).toBeTrue();
      expect(noTokenRef.referencedValue).toBe(noToken.heldValue);
      expect(noTokenRef.isStrongReference).toBeTrue();
      expect(noTokenRef.contextPrimitives).toEqual(["heldValue"]);
    }
  }

  const willBeReclaimed = new Registration;
  registry.register(willBeReclaimed.target, willBeReclaimed.heldValue, willBeReclaimed.token);
  // simulating a cleanup callback
  expect(cleanupCallback).toHaveBeenCalledTimes(0);
  registry[FLUSH_CELLS_OF_HELD_VALUE](willBeReclaimed.heldValue);
  // of course, the native registry still holds willBeReclaimed.
  expect(cleanupCallback).toHaveBeenCalledOnceWith(willBeReclaimed.heldValue);

  //#region same tests as before
  {
    const refs = registry[COLLECT_REFERENCES]();
    expect(refs.length).toBe(2);
    if (refs.length === 2) {
      const [cleanupRef, noTokenRef] = refs;
      expect(cleanupRef.collectionName).toBe("FinalizationRegistry");
      expect(cleanupRef.jointOwners.size).toBe(1);
      expect(cleanupRef.jointOwners.has(registry)).toBeTrue();
      expect(cleanupRef.referencedValue).toBe(cleanupCallback);
      expect(cleanupRef.isStrongReference).toBe(true);
      expect(cleanupRef.contextPrimitives).toEqual(["[[CleanupCallback]]"]);

      expect(noTokenRef.collectionName).toBe("FinalizationRegistry");
      expect(noTokenRef.jointOwners.size).toBe(2);
      expect(noTokenRef.jointOwners.has(registry)).toBeTrue();
      expect(noTokenRef.jointOwners.has(noToken.target)).toBeTrue();
      expect(noTokenRef.referencedValue).toBe(noToken.heldValue);
      expect(noTokenRef.isStrongReference).toBeTrue();
      expect(noTokenRef.contextPrimitives).toEqual(["heldValue"]);
    }
  }
  //#endregion same tests as before
  registry = undefined;
});
