import type {
  GuestEngine,
} from "../host-to-guest/GuestEngine.js";

import type {
  InstanceGetterDefinitions
} from "../types/InstanceGetterDefinitions.js";

export class InstanceGetterTracking<
  EngineObject extends object,
  EngineSymbol,
>
{
  readonly #definitions: InstanceGetterDefinitions<EngineObject, EngineSymbol>;

  readonly #classToGetterKeysMap = new QuickWeakMapOfSets<EngineObject, string | number | EngineSymbol>;
  readonly #classToInstancesMap = new QuickWeakMapOfSets<EngineObject, EngineObject>;
  readonly #baseClassToDerivedClassMap = new QuickWeakMapOfSets<EngineObject, EngineObject>;

  readonly #derivedClassToBaseClassMap = new WeakMap<EngineObject, EngineObject>;

  constructor(
    definitions: InstanceGetterDefinitions<EngineObject, EngineSymbol>
  )
  {
    this.#definitions = definitions;
  }

  public * addInstance(
    instance: EngineObject,
    classObject: EngineObject
  ): GuestEngine.Evaluator<void>
  {
    this.#classToInstancesMap.add(classObject, instance);

    const classStack: EngineObject[] = [];
    let currentClass: EngineObject | undefined = classObject;
    do {
      classStack.unshift(currentClass);
      currentClass = this.#derivedClassToBaseClassMap.get(currentClass);
    } while (currentClass);

    while (classStack.length) {
      currentClass = classStack.shift();
      for (const key of this.#classToGetterKeysMap.mapValues(currentClass!)) {
        yield* this.#definitions.defineInstanceGetter(instance, key);
      }
    }
  }

  public * addBaseClass(
    derivedClass: EngineObject,
    baseClass: EngineObject
  ): GuestEngine.Evaluator<void>
  {
    this.#baseClassToDerivedClassMap.add(baseClass, derivedClass);
    this.#derivedClassToBaseClassMap.set(derivedClass, baseClass);

    for (const key of this.#classToGetterKeysMap.mapValues(baseClass)) {
      yield * this.#notifyFoundPublicKey(derivedClass, key);
    }
  }

  public * addGetterName(
    baseClass: EngineObject,
    key: string | number | EngineSymbol
  ): GuestEngine.Evaluator<void>
  {
    this.#classToGetterKeysMap.add(baseClass, key);
    yield * this.#notifyFoundPublicKey(baseClass, key);
  }

  * #notifyFoundPublicKey(
    baseClass: EngineObject,
    key: string | number | EngineSymbol,
  ): GuestEngine.Evaluator<void>
  {
    for (const instance of this.#classToInstancesMap.mapValues(baseClass)) {
      yield * this.#definitions.defineInstanceGetter(instance, key);
    }

    for (const derivedClass of this.#baseClassToDerivedClassMap.mapValues(baseClass)) {
      yield * this.#notifyFoundPublicKey(derivedClass, key);
    }
  }
}

class QuickWeakMapOfSets<KeyType extends WeakKey, InnerSetType> {
  readonly #outerMap = new WeakMap<KeyType, Set<InnerSetType>>;

  add(
    mapKey: KeyType,
    setValue: InnerSetType
  ): void
  {
    let innerSet: Set<InnerSetType> | undefined = this.#outerMap.get(mapKey);
    if (!innerSet) {
      innerSet = new Set<InnerSetType>;
      this.#outerMap.set(mapKey, innerSet);
    }

    innerSet.add(setValue);
  }

  * mapValues(
    mapKey: KeyType
  ): IterableIterator<InnerSetType>
  {
    const innerSet: Set<InnerSetType> | undefined = this.#outerMap.get(mapKey);
    if (innerSet) {
      yield * innerSet.values();
    }
  }
}
