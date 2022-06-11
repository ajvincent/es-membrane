// #region PassThroughType type

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

const PassThroughSymbol = Symbol("Indeterminate return");

type PassThroughType<MethodType extends AnyFunction> = {
  modifiedArguments: Parameters<MethodType>;
  [PassThroughSymbol]: boolean;

  callTarget(key: string) : ReturnOrPassThroughType<MethodType>;

  run(): ReturnType<MethodType>;
}

type ReturnOrPassThroughType<MethodType extends AnyFunction> = ReturnType<MethodType> | PassThroughType<MethodType>;

// #endregion PassThroughType type

// This converts the method to another call signature, prepends the pass-through argument,
// and alters the return type to possibly return another pass-through.
type MaybePassThrough<MethodType extends AnyFunction> = (
  __previousResults__: PassThroughType<MethodType>,
  ...args: Parameters<MethodType>
) => ReturnOrPassThroughType<MethodType>;

type ComponentPassThroughClass<ClassType extends object> = {
  [Property in keyof ClassType]: ClassType[Property] extends AnyFunction ?
    MaybePassThrough<ClassType[Property]> :
    ClassType[Property];
}

type ComponentPassThroughMap<ClassType extends object> = Map<string, ComponentPassThroughClass<ClassType>>;

// #region class implementing PassThroughType

class PassThroughArgument<MethodType extends AnyFunction> implements PassThroughType<MethodType>
{
  modifiedArguments: Parameters<MethodType>;
  [PassThroughSymbol] = true;

  #initialTarget: string;
  #callbackMap: Map<string, MaybePassThrough<MethodType>>;

  #visitedTargets: Set<string> = new Set;

  constructor(
    initialTarget: string,
    callbacks: [string, MaybePassThrough<MethodType>][],
    initialArguments: Parameters<MethodType>
  )
  {
    this.#initialTarget = initialTarget;
    this.#callbackMap = new Map(callbacks);

    if (!this.#callbackMap.has(this.#initialTarget))
      throw new Error("Missing initial target!");

    this.modifiedArguments = initialArguments;
  }

  callTarget(key: string) : ReturnOrPassThroughType<MethodType>
  {
    if (this.#visitedTargets.has(key))
      throw new Error(`Visited target "${key}"!`)
    this.#visitedTargets.add(key);

    const target = this.#callbackMap.get(key);
    if (!target)
      throw new Error(`Missing target "${key}"!`);
    return target(this, ...this.modifiedArguments);
  }

  run(): ReturnType<MethodType>
  {
    const result = this.callTarget(this.#initialTarget);
    if (result instanceof PassThroughArgument)
      throw new Error("No resolved result!");
    return result as ReturnType<MethodType>;
  }
}

// #endregion class implementing PassThroughType

// #region NumberStringType
type NumberStringType = {
  repeatForward(s: string, n: number): string;
  repeatBack(n: number, s: string): string;
}

// #endregion NumberStringType

// #region test classes

class NSPT_CONTINUE implements ComponentPassThroughClass<NumberStringType> {
  repeatBack(
    __previousResults__: PassThroughType<NumberStringType["repeatBack"]>,
    n: number, s: string
  ): string | PassThroughType<NumberStringType["repeatBack"]>
  {
    void(n);
    void(s);
    return __previousResults__;
  }

  repeatForward(
    __previousResults__: PassThroughType<NumberStringType["repeatForward"]>,
    s: string, n: number
  ): string | PassThroughType<NumberStringType["repeatForward"]>
  {
    void(s);
    void(n);
    return __previousResults__;
  }
}

class NSPT_RETURN implements ComponentPassThroughClass<NumberStringType> {
  repeatBack(
    __previousResults__: PassThroughType<NumberStringType["repeatBack"]>,
    n: number, s: string
  ): string | PassThroughType<NumberStringType["repeatBack"]>
  {
    void(__previousResults__);
    return s.repeat(n);
  }

  repeatForward(
    __previousResults__: PassThroughType<NumberStringType["repeatForward"]>,
    s: string, n: number
  ): string | PassThroughType<NumberStringType["repeatForward"]>
  {
    void(__previousResults__);
    return s.repeat(n);
  }
}

class NSPT_THROW implements ComponentPassThroughClass<NumberStringType> {
  repeatForward(
    __previousResults__: PassThroughType<NumberStringType["repeatForward"]>,
    s: string, n: number
  ): string | PassThroughType<NumberStringType["repeatForward"]>
  {
    void(s);
    void(n);
    throw new Error("repeatForward throw");
  }

  repeatBack(
    __previousResults__: PassThroughType<NumberStringType["repeatBack"]>,
    n: number, s: string
  ): string | PassThroughType<NumberStringType["repeatBack"]>
  {
    void(n);
    void(s);
    throw new Error("repeatBack throw");
  }
}

const NST_CONTINUE = new NSPT_CONTINUE;
const NST_RESULT = new NSPT_RETURN;
const NST_THROW = new NSPT_THROW;

// #endregion test classes

// #region generated test classes

function NumberStringType_ClassesUnderTest (
  initialTarget: string,
  passThroughMap: ComponentPassThroughMap<NumberStringType>
) : NumberStringType
{
  class NumberString_ForwardTo implements NumberStringType
  {
    #invoke<__targetMethodType__ extends AnyFunction>(
      __methodName__: string,
      __args__: Parameters<__targetMethodType__>
    ): ReturnType<__targetMethodType__>
    {
      type __passThroughType__ = PassThroughType<__targetMethodType__>;
      type __maybePassThroughType__ = MaybePassThrough<__targetMethodType__>;
      type __returnOrPassThroughType__ = ReturnOrPassThroughType<__targetMethodType__>;

      const __keyAndCallbackArray__: [string, __maybePassThroughType__][] = [];

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

    repeatBack(
      ...__args__: Parameters<NumberStringType["repeatBack"]>
    ): ReturnType<NumberStringType["repeatBack"]>
    {
      return this.#invoke<NumberStringType["repeatBack"]>("repeatBack", __args__);
    }

    repeatForward(
      ...__args__: Parameters<NumberStringType["repeatForward"]>
    ): ReturnType<NumberStringType["repeatForward"]>
    {
      return this.#invoke<NumberStringType["repeatForward"]>("repeatForward", __args__);
    }
  }

  return new NumberString_ForwardTo;
}

class NumberStringType_Driver implements ComponentPassThroughClass<NumberStringType> {
  #subkeys: ReadonlyArray<string>;
  readonly #map: ComponentPassThroughMap<NumberStringType>;
  constructor(key: string, subkeys: string[], map: ComponentPassThroughMap<NumberStringType>)
  {
    this.#subkeys = subkeys;
    this.#map = map;

    map.set(key, this);
  }

  #invoke<__targetMethodType__ extends AnyFunction>(
    __methodName__: string,
    __previousResults__: PassThroughType<__targetMethodType__>,
    __args__: Parameters<__targetMethodType__>
  ): ReturnOrPassThroughType<__targetMethodType__>
  {
    for (const key of this.#subkeys)
    {
      if (!this.#map.has(key))
        throw new Error(`No component pass through for key "${key}"!`);
    }

    let result: ReturnOrPassThroughType<__targetMethodType__> = __previousResults__;
    for (const key of this.#subkeys)
    {
      const entry = this.#map.get(key) as ComponentPassThroughClass<__targetMethodType__>;

      const callback = Reflect.get(entry, __methodName__) as MaybePassThrough<__targetMethodType__>;
      result = callback(__previousResults__, ...__args__);
      if (result !== __previousResults__)
        break;
    }

    return result;
  }

  repeatBack(
    __previousResults__: PassThroughType<NumberStringType["repeatBack"]>,
    ...__args__: Parameters<NumberStringType["repeatBack"]>
  ): ReturnOrPassThroughType<NumberStringType["repeatBack"]>
  {
    return this.#invoke<NumberStringType["repeatBack"]>(
      "repeatBack",
      __previousResults__,
      __args__
    );
  }

  repeatForward(
    __previousResults__: PassThroughType<NumberStringType["repeatForward"]>,
    ...__args__: Parameters<NumberStringType["repeatForward"]>
  ): string | PassThroughType<NumberStringType["repeatForward"]>
  {
    return this.#invoke<NumberStringType["repeatForward"]>(
      "repeatForward",
      __previousResults__,
      __args__
    );
  }

  static build(key: string, subkeys: string[], map: ComponentPassThroughMap<NumberStringType>) : void
  {
    void(new NumberStringType_Driver(key, subkeys, map))
  }
}

// #endregion generated test classes

// #region exercise generated test classes

const NST_COMPONENT_MAP: ComponentPassThroughMap<NumberStringType> = new Map;
NST_COMPONENT_MAP.set("continue", NST_CONTINUE);
NST_COMPONENT_MAP.set("result", NST_RESULT);
NST_COMPONENT_MAP.set("throw", NST_THROW);

NumberStringType_Driver.build(
  "driver",
  ["continue", "result", "throw"],
  NST_COMPONENT_MAP
);

const TestClass = NumberStringType_ClassesUnderTest(
  "driver",
  NST_COMPONENT_MAP
);

// eslint-disable-next-line no-debugger
debugger;
console.log(TestClass.repeatForward("foo", 3));

// #endregion exercise generated test classes

