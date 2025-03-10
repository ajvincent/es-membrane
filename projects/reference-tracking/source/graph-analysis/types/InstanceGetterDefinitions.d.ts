export interface InstanceGetterDefinitions<EngineObject, EngineSymbol>
{
  defineInstanceGetter(
    instance: EngineObject,
    getterKey: string | number | EngineSymbol,
  ): void;

  definePrivateInstanceGetter(
    instance: EngineObject,
    privateKey: EngineObject,
  ): void;
}
