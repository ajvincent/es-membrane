import fs from "fs/promises";
import path from "path";
import url from "url";

const templatePath = url.fileURLToPath(path.join(import.meta.url, "../PassThroughGenerated.mts.in"));
const template = await fs.readFile(templatePath, { encoding: "utf-8"});
void(template);

import type { AnyFunction } from "./AnyFunction.mjs";

import type {
  PassThroughType,
  ReturnOrPassThroughType,
  MaybePassThrough,
  ComponentPassThroughClass,
  ComponentPassThroughMap,
} from "./PassThroughSupport.mjs";
import {
  PassThroughArgument,
} from "./PassThroughSupport.mjs";

// A key for derived classes to use.  A symbol to prevent conflicts with existing types.
export const INVOKE_SYMBOL = Symbol("protected invoke");

/**
 * The entry point from a non-augmented type into pass-through-augmented components.
 */
export class ForwardTo_Base {
  constructor() {
    if (new.target === ForwardTo_Base)
      throw new Error("Do not construct this class directly: subclass it!");
  }

  /**
   * @typeParam TargetMethodType - The type of the original method.
   * @typeParam TargetClassType  - The type of the original class holding the method.
   * @param initialTarget  - The starting target name in passThroughMap.
   * @param passThroughMap - The map of component classes.
   * @param methodName - The name of the method we want to call, which we get from each component via Reflect.
   * @param initialArguments       - The initial arguments to pass to the starting target.
   * @returns The original target method's type.
   */
  protected [INVOKE_SYMBOL]<
    TargetMethodType extends AnyFunction,
    TargetClassType extends object
  >
  (
    initialTarget: string | symbol,
    passThroughMap: ComponentPassThroughMap<TargetClassType>,
    methodName: string,
    initialArguments: Parameters<TargetMethodType>
  ): ReturnType<TargetMethodType>
  {
    // Convenience types we'll use a few times.
    type PassThroughMethodType         = PassThroughType<TargetMethodType>;
    type MaybePassThroughMethodType    = MaybePassThrough<TargetMethodType>;
    type ReturnOrPassThroughMethodType = ReturnOrPassThroughType<TargetMethodType>;

    // Map from a set of classes to the specifie method in each class.
    // This will go into a `new Map(__keyAndCallbackArray)`.
    // {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/Map#parameters}
    const __keyAndCallbackArray__: [string | symbol, MaybePassThroughMethodType][] = [];

    passThroughMap.forEach((component, key) => {
      const __method__ = Reflect.get(component, methodName) as MaybePassThroughMethodType;

      // A convenience callback to bind the method to its parent component and key.
      type Callback = (
        passThrough: PassThroughMethodType,
        ... __args__: Parameters<TargetMethodType>
      ) => ReturnOrPassThroughMethodType;

      const __callback__: Callback = (passThrough, ...__args__) => {
        __args__ = passThrough.modifiedArguments;
        return __method__.apply(
          component,
          [passThrough, ...__args__]
        );
      };

      __keyAndCallbackArray__.push([key, __callback__]);
    });

    if (!passThroughMap.has(initialTarget)) {
      throw new Error("No initial target?");
    }

    // Create our pass-through argument.
    const __passThrough__ = new PassThroughArgument<TargetMethodType>(
      initialTarget, __keyAndCallbackArray__, initialArguments
    )

    // Let it take over.
    return __passThrough__.run();
  }
}

/**
 * A base class for a sequence of augmented components.
 *
 * Create a subclass of ForwardTo_Base first,
 */
export class ForwardToSequence_Base<ClassType extends object>
{
  #subkeys: ReadonlyArray<string | symbol>;
  readonly #map: ComponentPassThroughMap<ClassType>;

  /**
   * @param key     - A root key to define to track the subkeys.
   * @param subkeys - The sequence of subkeys to run for this class.
   * @param map     - The map of keys to component classes.
   */
  constructor(
    key: string | symbol,
    subkeys: (string | symbol)[],
    map: ComponentPassThroughMap<ClassType>,
  )
  {
    if (new.target === ForwardToSequence_Base)
      throw new Error("Do not construct this class directly: subclass it!");

    if ((new Set(subkeys)).size !== subkeys.length)
      throw new Error("Duplicate key among the subkeys!");

    if (map.has(key))
      throw new Error(`The key "${String(key)}" is already in the map!`);

    this.#subkeys = subkeys;
    this.#map = map;

    // Cache this in the map as a defined component.
    map.set(key, this as unknown as ComponentPassThroughClass<ClassType>);
  }

  /**
   * Invoke each method of the sequence of components, until we get a definite result.
   * @typeParam TargetMethodType - The type of the method we will call.
   * @param methodName           - The name of the method we will call on each component.
   * @param passThroughArgument  - The pass-through argument from ForwardTo_Base.
   * @param __args__             - The original arguments.
   * @returns The first definitive result.
   */
  protected [INVOKE_SYMBOL]<
    TargetMethodType extends AnyFunction
  >
  (
    methodName: string,
    passThroughArgument: PassThroughType<TargetMethodType>,
  ): ReturnOrPassThroughType<TargetMethodType>
  {
    // Sanity check.
    for (const key of this.#subkeys)
    {
      if (!this.#map.has(key))
        throw new Error(`No component pass through for key "${String(key)}"!`);
    }

    let result: ReturnOrPassThroughType<TargetMethodType> = passThroughArgument;

    for (const key of this.#subkeys)
    {
      const entry = this.#map.get(key);
      if (!entry) {
        // In some situations, we may not have a component for a given key.
        // Thimk of this as handling debugging code, which we simply don't enable.
        continue;
      }

      // Call the augmented method of the component.
      const callback = Reflect.get(entry, methodName) as MaybePassThrough<TargetMethodType>;
      result = callback(passThroughArgument, ...passThroughArgument.modifiedArguments);

      if (result !== passThroughArgument) {
        // We're done.
        break;
      }
    }

    return result;
  }
}

export async function GenerateTypedPassThrough(

) : Promise<void>
{
  void(false);
}
