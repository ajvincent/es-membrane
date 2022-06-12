import fs from "fs/promises";
import path from "path";
import url from "url";

const templatePath = url.fileURLToPath(path.join(import.meta.url, "../PassThroughGenerated.mts.in"));
const template = await fs.readFile(templatePath, { encoding: "utf-8"});
void(template);

export const INVOKE_SYMBOL = Symbol("protected invoke");

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

export class ForwardTo_Base {
  protected [INVOKE_SYMBOL]<
    __targetMethodType__ extends AnyFunction,
    __targetClassType__ extends object
  >
  (
    initialTarget: string | symbol,
    passThroughMap: ComponentPassThroughMap<__targetClassType__>,
    __methodName__: string,
    __args__: Parameters<__targetMethodType__>
  ): ReturnType<__targetMethodType__>
  {
    type __passThroughType__ = PassThroughType<__targetMethodType__>;
    type __maybePassThroughType__ = MaybePassThrough<__targetMethodType__>;
    type __returnOrPassThroughType__ = ReturnOrPassThroughType<__targetMethodType__>;

    const __keyAndCallbackArray__: [string | symbol, __maybePassThroughType__][] = [];

    passThroughMap.forEach((component, key) => {
      const __method__ = Reflect.get(component, __methodName__) as __maybePassThroughType__;
      const __callback__ = (
        __passThrough__: __passThroughType__,
        ...__args__: Parameters<__targetMethodType__>
      ): __returnOrPassThroughType__ =>
      {
        return __method__.apply(component, [__passThrough__, ...__args__]);
      };
      __keyAndCallbackArray__.push([key, __callback__]);
    });

    if (!passThroughMap.has(initialTarget)) {
      throw new Error("No initial target?");
    }

    const __passThrough__ = new PassThroughArgument<__targetMethodType__>(
      initialTarget, __keyAndCallbackArray__, __args__
    )

    return __passThrough__.run();
  }
}

export class MultiDriver_Base<ClassType extends object>
{
  #subkeys: ReadonlyArray<string | symbol>;
  readonly #map: ComponentPassThroughMap<ClassType>;
  constructor(
    key: string | symbol,
    subkeys: (string | symbol)[],
    map: ComponentPassThroughMap<ClassType>
  )
  {
    this.#subkeys = subkeys;
    this.#map = map;

    map.set(key, this as unknown as ComponentPassThroughClass<ClassType>)
  }

  protected [INVOKE_SYMBOL]<__targetMethodType__ extends AnyFunction>
  (
    __methodName__: string,
    __previousResults__: PassThroughType<__targetMethodType__>,
    __args__: Parameters<__targetMethodType__>
  ): ReturnOrPassThroughType<__targetMethodType__>
  {
    for (const key of this.#subkeys)
    {
      if (!this.#map.has(key))
        throw new Error(`No component pass through for key "${String(key)}"!`);
    }

    let result: ReturnOrPassThroughType<__targetMethodType__> = __previousResults__;
    for (const key of this.#subkeys)
    {
      const entry = this.#map.get(key) as ComponentPassThroughClass<ClassType>;

      const callback = Reflect.get(entry, __methodName__) as MaybePassThrough<__targetMethodType__>;
      result = callback(__previousResults__, ...__args__);
      if (result !== __previousResults__)
        break;
    }

    return result;
  }
}

export async function GenerateTypedPassThrough(

) : Promise<void>
{
  void(false);
}
