export class InstanceGetterTracking<
  EngineObject,
  EngineSymbol,
>
{
  readonly #definitions: InstanceGetterTracking<EngineObject, EngineSymbol>;
  constructor(
    definitions: InstanceGetterTracking<EngineObject, EngineSymbol>
  )
  {
    this.#definitions = definitions;
    void(this.#definitions);
  }

  public addInstance(
    instance: EngineObject,
    classObject: EngineObject
  ): void
  {
    void(instance);
    void(classObject);
    throw new Error("not yet implemented");
  }

  public addBaseClass(
    derivedClass: EngineObject,
    baseClass: EngineObject
  ): void {
    void(derivedClass);
    void(baseClass);
    throw new Error("not yet implemented");
  }

  public addGetterName(
    baseClass: EngineObject,
    key: string | number | EngineSymbol
  ): void
  {
    void(baseClass);
    void(key);
    throw new Error("not yet implemented");
  }

  public addPrivateGetterName(
    baseClass: EngineObject,
    privateKey: EngineObject
  ): void
  {
    void(baseClass);
    void(privateKey);
    throw new Error("not yet implemented");
  }
}
