/* https://nodejs.org/api/packages.html#imports
   This is an internal build tool, so it's all right to use a private import.
 */
import { DefaultWeakMap } from "#stageUtilities/DefaultMap.mjs";

import {
  AnyFunction,
  PropertyKey,
} from "./internal/Common.mjs";

import {
  ComponentPassThroughClass,
  PassThroughSymbol,
  PassThroughType,
  MaybePassThrough,
} from "./internal/PassThroughSupport.mjs";

// #region Global ComponentMap

/**
 * Components and sequences to override in the default settings.
 * @see InstanceToComponentMap_Type.override()
 * @public
 */
export type ComponentMapOverride<
  PublicClassType extends object,
  ThisClassType extends PublicClassType
> =
{
  readonly startComponent: PropertyKey;
  readonly components: ReadonlyMap<
    PropertyKey,
    ComponentPassThroughClass<PublicClassType, ThisClassType>
  >;
  readonly sequences: ReadonlyMap<PropertyKey, PropertyKey[]>;
};

/**
 * This is your primary interface for accessing components and sequences, and
 * overriding them via the override() method.  Defaults are set at build time.
 * @public
 */
export interface InstanceToComponentMap_Type<
  PublicClassType extends object,
  ThisClassType extends PublicClassType
>
{
  /**
   * A list of known component and sequence keys for the default map.
   */
  get defaultKeys(): PropertyKey[];

  /**
   * The start component key.  Required before creating a base instance.
   */
  get defaultStart(): PropertyKey | undefined;

  /**
   * Get a component.  This can be useful for replacing a component with a spy on the component
   *
   * @param instance      - The instance to get a component for.
   * @param componentKey  - The key for the component.
   * @returns The component.
   * @throws if there is no component for the key.
   */
  getComponent(
    instance: PublicClassType,
    componentKey: PropertyKey
  ): ComponentPassThroughClass<PublicClassType, ThisClassType>;

  /**
   * Get a sequence for a known top key.  This can be useful in inserting spies into a sequence.
   *
   * @param instance - The instance to get a component for.
   * @param topKey   - The top key to look up.
   * @returns The sequence, or an empty array if there is no sequence.
   * @public
   */
  getSequence(
    instance: PublicClassType,
    topKey: PropertyKey
  ): PropertyKey[];

  /**
   * Override the components and sequences for a given instance.
   * This overlays the configuration's components, sequences and start
   * component over the existing defaults.  Existing components and sequences
   * you don't override are still available.
   *
   * @param instance - The instance we wish to override components for.
   * @param configuration - The configuration of override components and sequences.
   */
  override(
    instance: PublicClassType,
    configuration: ComponentMapOverride<PublicClassType, ThisClassType>
  ) : void;

  /**
   * Get a component map.
   * @param instance - The instance to get the map for.
   * @returns the component map.
   * @internal
   */
  getMapForInstance(
    instance: PublicClassType
  ): ReadonlyKeyToComponentMap<PublicClassType, ThisClassType>;
}

/**
 * This interface is for creating the default component map in
 * internal/PassThroughClassType.mts.
 * @internal
 */
export interface InstanceToComponentMap_TypeDefault<
  PublicClassType extends object, ThisClassType extends PublicClassType
> extends InstanceToComponentMap_Type<PublicClassType, ThisClassType>
{
  /**
   * Add a default component by key name.
   *
   * @param key       - The key for the component.
   * @param component - The component.
   */
  addDefaultComponent(
    key: PropertyKey,
    component: ComponentPassThroughClass<PublicClassType, ThisClassType>
  ): void;

  /**
   * Add a default sequence.
   * @param topKey  - The key defining the sequence.
   * @param subKeys - The keys of the sequence.
   */
  addDefaultSequence(topKey: PropertyKey, subKeys: PropertyKey[]): void;

  /**
   * The start component key.  Required before creating a base instance.
   */
  set defaultStart(key: PropertyKey | undefined);
}

/**
 * This provides a mapping from an instance of a base class to pass-through
 * component classes (and sequences thereof), and API for setting default
 * components and sequences.
 *
 * This also exposes an `override()` method to replace the default
 * components map with a custom map for testing purposes (i.e. inserting a stub
 * for Jasmine spies) on a very specific Entry_Base instance.
 *
 * @sealed
 */
export default class InstanceToComponentMap<
  PublicClassType extends object,
  ThisClassType extends PublicClassType
> implements InstanceToComponentMap_TypeDefault<PublicClassType, ThisClassType>
{
  constructor()
  {
    if (new.target !== InstanceToComponentMap)
      throw new Error("This class may not be subclassed!");
    Object.freeze(this);
  }

  /**
   * Override components for each instance.
   */
  readonly #overrideMap = new WeakMap<
    PublicClassType,
    ReadonlyKeyToComponentMap<PublicClassType, ThisClassType>
  >;

  /**
   * Default components for each instance.
   */
  readonly #default = new KeyToComponentMap<PublicClassType, ThisClassType>;

  /**
   * Convenience map for reusing the same overrides on several instances.
   */
  readonly #overrideContextToComponentMap = new DefaultWeakMap<
    ComponentMapOverride<PublicClassType, ThisClassType>,
    ReadonlyKeyToComponentMap<PublicClassType, ThisClassType>
  >;

  /**
   * Get a component map.
   * @param instance - The instance to get the map for.
   * @returns the component map.
   * @internal
   */
  getMapForInstance(
    instance: PublicClassType
  ) : ReadonlyKeyToComponentMap<PublicClassType, ThisClassType>
  {
    return this.#overrideMap.get(instance) || this.#default;
  }

  /**
   * Get a component.
   *
   * @param instance      - The instance to get a component for.
   * @param componentKey  - The key for the component.
   * @returns The component.
   * @throws if there is no component for the key.
   */
  getComponent(
    instance: PublicClassType,
    componentKey: PropertyKey
  ): ComponentPassThroughClass<PublicClassType, ThisClassType>
  {
    const submap = this.#overrideMap.get(instance) ?? this.#default;
    return submap.getComponent(componentKey);
  }

  /**
   * Add a default component by key name.
   *
   * @param key       - The key for the component.
   * @param component - The component.
   */
  addDefaultComponent(
    key: PropertyKey,
    component: ComponentPassThroughClass<PublicClassType, ThisClassType>
  ) : void
  {
    this.#default.addComponent(key, component);
  }

  /**
   * Get a sequence for a known top key.
   * @param instance - The instance to get a component for.
   * @param topKey   - The top key to look up.
   * @returns The sequence, or an empty array if there is no sequence.
   */
  getSequence(
    instance: PublicClassType,
    topKey: PropertyKey
  ) : PropertyKey[]
  {
    const submap = this.#overrideMap.get(instance) ?? this.#default;
    return submap.getSequence(topKey);
  }

  /**
   * Add a default sequence.
   * @param topKey  - The key defining the sequence.
   * @param subKeys - The keys of the sequence.
   */
  addDefaultSequence(
    topKey: PropertyKey,
    subKeys: PropertyKey[]
  ) : void
  {
    this.#default.addSequence(topKey, subKeys);
  }

  /**
   * A list of known component and sequence keys for the default map.
   */
  get defaultKeys() : PropertyKey[]
  {
    return this.#default.keys;
  }

  /**
   * The start component key.  Required before creating a base instance.
   */
  get defaultStart() : PropertyKey | undefined
  {
    return this.#default.startComponent;
  }
  set defaultStart(key: PropertyKey | undefined)
  {
    this.#default.startComponent = key;
  }

  /**
   * Override the components and sequences for a given instance.
   * @param instance - The instance we wish to override components for.
   * @param configuration - The configuration of override components and sequences.
   */
  override(
    instance: PublicClassType,
    configuration: ComponentMapOverride<PublicClassType, ThisClassType>
  ) : void
  {
    if (this.#overrideMap.has(instance))
      throw new Error("Override already exists for the instance!");

    const map = this.#overrideContextToComponentMap.getDefault(
      configuration,
      () => this.#buildOverrideMap(configuration)
    );

    this.#overrideMap.set(instance, map);
  }

  /**
   * Build an override component map for a given configuration.
   * @param configuration - the components, sequences, and start component to use.
   * @returns the override map.
   */
  #buildOverrideMap(
    configuration: ComponentMapOverride<PublicClassType, ThisClassType>
  ) : ReadonlyKeyToComponentMap<PublicClassType, ThisClassType>
  {
    const map = new KeyToComponentMap<PublicClassType, ThisClassType>;

    // Pick up components, starting with the overrides.
    {
      const defaultComponentKeys = new Set(this.#default.keys.filter(
        key => this.#default.getSequence(key).length === 0
      ));

      configuration.components.forEach((value, key) => {
        map.addComponent(key, value);
        defaultComponentKeys.delete(key);
      });

      defaultComponentKeys.forEach(key => {
        map.addComponent(key, this.#default.getComponent(key));
      });
    }

    // Pick up sequences, starting with the overrides.
    {
      const defaultSequenceKeys = new Set(this.#default.keys.filter(
        key => this.#default.getSequence(key).length > 0
      ));

      configuration.sequences.forEach((subkeys, key) => {
        map.addSequence(key, subkeys);
        defaultSequenceKeys.delete(key);
      });

      defaultSequenceKeys.forEach(key => {
        map.addSequence(key, this.#default.getSequence(key));
      });
    }

    map.startComponent = configuration.startComponent;
    return map;
  }
}
Object.freeze(InstanceToComponentMap);
Object.freeze(InstanceToComponentMap.prototype);

// #endregion Global ComponentMap

// #region KeyToComponentMap: Internal API for mapping keys to components and sequences.
/**
 * This is the real workhorse:  mapping from a key either to a component instance
 * matching the API of the pass-through-augmented class, or to a sequence of existing
 * keys.
 *
 * @internal
 */
interface ReadonlyKeyToComponentMap<
  PublicClassType extends object,
  ThisClassType extends PublicClassType
>
{
  /**
   * Get a component.
   *
   * @param key - The key for the component.
   * @returns The component.
   * @throws if there is no component for the key.
   */
  getComponent(
    key: PropertyKey
  ) : ComponentPassThroughClass<PublicClassType, ThisClassType>;

  /**
   * Get a sequence for a known top key.
   * @param topKey   - The top key to look up.
   * @returns The sequence, or an empty array if there is no sequence.
   */
  getSequence(
    topKey: PropertyKey
  ) : PropertyKey[];

  /**
   * A list of known component and sequence keys.
   */
  get keys(): PropertyKey[];

  /**
   * The start component key.  Required before creating a base instance.
   */
  get startComponent(): PropertyKey | undefined;

  /**
   * Build a pass-through argument for a method.
   *
   * @typeParam MethodType - The type of the non-augmented method.
   * @param methodName       - The name of the method to invoke.
   * @param initialArguments - The initial arguments of the method.
   * @returns The pass-through argument.
   *
   * @see Entry_Base.prototype[INVOKE_SYMBOL]
   */
  buildPassThrough<
    MethodType extends AnyFunction
  >
  (
    entryPoint: ThisClassType,
    methodName: PropertyKey,
    initialArguments: Parameters<MethodType>
  ) : PassThroughType<PublicClassType, MethodType, ThisClassType>;
}

/**
 * @internal
 * @sealed
 */
class KeyToComponentMap<
  PublicClassType extends object,
  ThisClassType extends PublicClassType
> implements ReadonlyKeyToComponentMap<PublicClassType, ThisClassType>
{
  /**
   * Disallow empty string keys.
   * @param key - The key to check.
   */
  static #validateKey(key: PropertyKey) : void
  {
    if (key === "")
      throw new Error("key cannot be an empty string!");
  }

  constructor()
  {
    if (new.target !== KeyToComponentMap)
      throw new Error("This class may not be subclassed!");
    Object.freeze(this);
  }

  #startComponent?: PropertyKey;
  readonly #componentMap = new Map<
    PropertyKey,
    ComponentPassThroughClass<PublicClassType, ThisClassType>
  >;
  readonly #sequenceMap = new Map<PropertyKey, PropertyKey[]>;

  /**
   * Get a component.
   *
   * @param key - The key for the component.
   * @returns The component.
   * @throws if there is no component for the key.
   */
  getComponent(
    key: PropertyKey
  ) : ComponentPassThroughClass<PublicClassType, ThisClassType>
  {
    KeyToComponentMap.#validateKey(key);
    const rv = this.#componentMap.get(key);
    if (!rv)
      throw new Error("No component match!");
    return rv;
  }

  /**
   * Add a component by key name.
   *
   * @param key       - The key for the component.
   * @param component - The component.
   */
  addComponent(
    key: PropertyKey,
    component: ComponentPassThroughClass<PublicClassType, ThisClassType>
  ) : void
  {
    KeyToComponentMap.#validateKey(key);
    if (this.#componentMap.has(key) || this.#sequenceMap.has(key))
      throw new Error("Key is already defined!");
    this.#componentMap.set(key, component);
  }

  /**
   * Get a sequence for a known top key.
   * @param topKey   - The top key to look up.
   * @returns The sequence, or an empty array if there is no sequence.
   */
  getSequence(
    topKey: PropertyKey
  ): PropertyKey[]
  {
    return this.#sequenceMap.get(topKey)?.slice() ?? [];
  }

  /**
   * Add a sequence.
   * @param topKey  - The key defining the sequence.
   * @param subKeys - The keys of the sequence.
   */
  addSequence(
    topKey: PropertyKey,
    subKeys: PropertyKey[]
  ) : void
  {
    if (subKeys.length < 2)
      throw new Error("There must be at least two subkeys!");

    {
      const setOfKeys = new Set(subKeys);
      if (setOfKeys.size < subKeys.length)
        throw new Error("Duplicate key among the subkeys!");
      if (setOfKeys.has(topKey))
        throw new Error("Top key cannot be among the subkeys!");
    }

    /* Disabled because override() might not copy the subkeys.
    subKeys.forEach(subKey => {
      if (!this.#componentMap.has(subKey) && !this.#sequenceMap.has(subKey))
        throw new Error(`Unknown subkey "${String(subKey)}"!`);
    });
    */

    if (this.#componentMap.has(topKey) || this.#sequenceMap.has(topKey))
      throw new Error(`The top key is already in the map!`);

    this.#sequenceMap.set(topKey, subKeys.slice());
  }

  /**
   * A list of known component and sequence keys.
   */
  get keys() : PropertyKey[]
  {
    const mapKeys = Array.from(this.#componentMap.keys()),
          sequenceKeys = Array.from(this.#sequenceMap.keys());
    return [...mapKeys, ...sequenceKeys];
  }

  /**
   * The start component key.  Required before creating a base instance.
   */
  get startComponent() : PropertyKey | undefined
  {
    return this.#startComponent;
  }
  set startComponent(key: PropertyKey | undefined)
  {
    if (key === undefined)
      throw new Error("Start component must be a non-empty string or a symbol!");

    KeyToComponentMap.#validateKey(key);

    if (this.#startComponent)
      throw new Error("This map already has a start component!");

    if (!this.#componentMap.has(key) && !this.#sequenceMap.has(key))
      throw new Error("You haven't registered the start component yet!");

    this.#startComponent = key;
  }

  /**
   * Build a pass-through argument for a method.
   *
   * @typeParam MethodType - The type of the non-augmented method.
   * @param methodName       - The name of the method to invoke.
   * @param initialArguments - The initial arguments of the method.
   * @returns The pass-through argument.
   *
   * @see Entry_Base.prototype[INVOKE_SYMBOL]
   */
  buildPassThrough<
    MethodType extends AnyFunction
  >
  (
    entryPoint: ThisClassType,
    methodName: PropertyKey,
    initialArguments: Parameters<MethodType>
  ) : PassThroughType<PublicClassType, MethodType, ThisClassType>
  {
    return new PassThroughArgument<
      PublicClassType, MethodType, ThisClassType
    >(this, entryPoint, methodName, initialArguments);
  }
}
Object.freeze(KeyToComponentMap);
Object.freeze(KeyToComponentMap.prototype);

// #endregion KeyToComponentMap: Internal API for mapping keys to components and sequences.

// #region PassThroughArgument

/**
 * This class defines the flow-control system.  It provides:
 * - modifiedArguments, which follows the shape of the original method
 * - callTarget() for calling other component classes with the modifiedArguments.
 * - getReturnValue() for the current return value, if it has been set.
 * - setReturnValue() for setting the return value
 * - entryPoint for going back to the starting instance.
 *
 * @public
 */
class PassThroughArgument<
  PublicClassType extends object,
  MethodType extends AnyFunction,
  ThisClassType extends PublicClassType
> implements PassThroughType<PublicClassType, MethodType, ThisClassType>
{
  /**
   * A simple flag to indicate this is a pass-through argument.
   */
  readonly [PassThroughSymbol] = true;

  /**
   * The arguments we pass around.  This is explicitly not readonly because I
   * anticipate users changing the arguments.
   */
  modifiedArguments: Parameters<MethodType>;

  readonly entryPoint: ThisClassType;

  readonly #componentMap: ReadonlyKeyToComponentMap<PublicClassType, ThisClassType>;
  readonly #methodName: PropertyKey;
  readonly #visitedTargets: Set<PropertyKey> = new Set;

  #hasReturnValue = false;
  #returnValue?: ReturnType<MethodType>;

  /**
   * Set up initial conditions.
   * @param componentMap     - The component map.
   * @param methodName       - The method we should invoke.
   * @param initialArguments - The initial arguments of the method.
   * @internal
   * @see KeyToComponentMap.prototype.buildPassThrough
   */
  constructor(
    componentMap: ReadonlyKeyToComponentMap<PublicClassType, ThisClassType>,
    entryPoint: ThisClassType,
    methodName: PropertyKey,
    initialArguments: Parameters<MethodType>
  )
  {
    this.#componentMap = componentMap;
    this.#methodName = methodName;
    this.modifiedArguments = initialArguments;
    this.entryPoint = entryPoint;
    Object.seal(this);
  }

  /**
   * Call the method of a particular component (or sequence of components).
   *
   * Think twice about using this in a Production environment.  Support for
   * this will just complicate the final target code.
   *
   * @param componentKey - The key of the component in this.#componentMap.
   * @returns whatever the component returns.
   * @public
   */
  callTarget(componentKey: PropertyKey) : void
  {
    if (this.#visitedTargets.has(componentKey))
      throw new Error(`Visited target "${String(componentKey)}"!`);
    this.#visitedTargets.add(componentKey);

    const sequence = this.#componentMap.getSequence(componentKey);
    if (sequence.length) {
      do {
        this.callTarget(sequence.shift() as PropertyKey);
      } while (sequence.length);

      return;
    }

    const component = this.#componentMap.getComponent(componentKey);

    const method = Reflect.get(
      component, this.#methodName
    ) as MaybePassThrough<PublicClassType, MethodType, ThisClassType>;
    method.apply(component, [this, ...this.modifiedArguments]);
  }

  /**
   * Get the return value, if it's available.
   * @public
   */
  getReturnValue(): [false, undefined] | [true, ReturnType<MethodType>]
  {
    if (!this.#hasReturnValue)
      return [false, undefined];
    return [true, this.#returnValue as ReturnType<MethodType>];
  }

  /**
   * Set the return value.
   *
   * @param value - The value to return.  Only callable once.
   * @public
   */
  setReturnValue(value: ReturnType<MethodType>): void
  {
    if (this.#hasReturnValue)
      throw new Error("There is already a return value here!");
    this.#hasReturnValue = true;
    this.#returnValue = value;
  }
}
Object.freeze(PassThroughArgument);
Object.freeze(PassThroughArgument.prototype);

// #endregion PassThroughArgument
