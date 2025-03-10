import type {
  InstanceGetterDefinitions
} from "./types/InstanceGetterDefinitions.js";

export class InstanceGetterTracking<
  EngineObject extends object,
  EngineSymbol,
>
{
  readonly #definitions: InstanceGetterDefinitions<EngineObject, EngineSymbol>;

  readonly #classToGetterKeysMap = new QuickWeakMapOfSets<EngineObject, string | number | EngineSymbol>;
  readonly #classToPrivateKeysMap = new QuickWeakMapOfSets<EngineObject, EngineObject>;
  readonly #classToInstancesMap = new QuickWeakMapOfSets<EngineObject, EngineObject>;
  readonly #baseClassToDerivedClassMap = new QuickWeakMapOfSets<EngineObject, EngineObject>;

  readonly #derivedClassToBaseClassMap = new WeakMap<EngineObject, EngineObject>;

  constructor(
    definitions: InstanceGetterDefinitions<EngineObject, EngineSymbol>
  )
  {
    this.#definitions = definitions;
  }

  public addInstance(
    instance: EngineObject,
    classObject: EngineObject
  ): void
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
        this.#definitions.defineInstanceGetter(instance, key);
      }

      for (const key of this.#classToPrivateKeysMap.mapValues(currentClass!)) {
        this.#definitions.definePrivateInstanceGetter(instance, key);
      }
    }
  }

  public addBaseClass(
    derivedClass: EngineObject,
    baseClass: EngineObject
  ): void
  {
    this.#baseClassToDerivedClassMap.add(baseClass, derivedClass);
    this.#derivedClassToBaseClassMap.set(derivedClass, baseClass);

    for (const key of this.#classToGetterKeysMap.mapValues(baseClass)) {
      this.#notifyFoundPublicKey(derivedClass, key);
    }

    for (const key of this.#classToPrivateKeysMap.mapValues(baseClass)) {
      this.#notifyFoundPrivateKey(derivedClass, key);
    }
  }

  public addGetterName(
    baseClass: EngineObject,
    key: string | number | EngineSymbol
  ): void
  {
    this.#classToGetterKeysMap.add(baseClass, key);
    this.#notifyFoundPublicKey(baseClass, key);
  }

  #notifyFoundPublicKey(
    baseClass: EngineObject,
    key: string | number | EngineSymbol,
  ): void
  {
    for (const instance of this.#classToInstancesMap.mapValues(baseClass)) {
      this.#definitions.defineInstanceGetter(instance, key);
    }

    for (const derivedClass of this.#baseClassToDerivedClassMap.mapValues(baseClass)) {
      this.#notifyFoundPublicKey(derivedClass, key);
    }
  }

  public addPrivateGetterName(
    baseClass: EngineObject,
    privateKey: EngineObject
  ): void
  {
    this.#classToPrivateKeysMap.add(baseClass, privateKey);
    this.#notifyFoundPrivateKey(baseClass, privateKey);
  }

  #notifyFoundPrivateKey(
    classObject: EngineObject,
    privateKey: EngineObject
  ): void
  {
    for (const instance of this.#classToInstancesMap.mapValues(classObject)) {
      this.#definitions.definePrivateInstanceGetter(instance, privateKey);
    }

    for (const derivedClass of this.#baseClassToDerivedClassMap.mapValues(classObject)) {
      this.#notifyFoundPrivateKey(derivedClass, privateKey);
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
