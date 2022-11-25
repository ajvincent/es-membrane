# Pass-through components

## Concepts as types

Consider again our base type:

```typescript
type NumberStringType = {
  repeatForward(
    s: string,
    n: number
  ): string;

  repeatBack(
    n: number,
    s: string
  ): string;
};
```

At this stage, all we have is an API.  We need some way of identifying components, and passing arguments between them.  So consider this type:

```typescript
type NumberStringTypeWithPassThrough = {
  repeatForward(
    __passThrough__: PassThroughArgumentType<NumberStringType["repeatForward"]>,
    s: string,
    n: number
  ) : void

  repeatBack(
    __passThrough__: PassThroughArgumentType<NumberStringType["repeatBack"]>,
    n: number,
    s: string
  ) : void
};
```

This "pass-through type" has the same basic structure, with a prepended argument and a void return type for each method.  You set the actual return value by invoking `return __passThrough__.setReturnValue(rv);`.

What's the shape of this new argument?

```typescript
/**
 * @typeParam PublicClassType - The class type each component guarantees to implement
 * @typeParam MethodType      - A public member method of PublicClassType
 * @typeParam ThisClassType   - A type with helper methods for components to call on the entryPoint.
 *                              Think of this as holding "pseudo-private" methods, which should be private in
 *                              the final integrated class.
 * @see KeyToComponentMap_Base.mts for implementation of PassThroughType, in PassThroughArgument.
 */
export type PassThroughType<
  PublicClassType extends object,
  MethodType extends AnyFunction,
  ThisClassType extends PublicClassType
> =
{
  // This marks the type as unique.
  [PassThroughSymbol]: boolean;

  // We can replace the arguments from one step to the next, using modifiedArguments.
  modifiedArguments: Parameters<MethodType>;

  // This allows us to call another method with the modifiedArguments.
  callTarget(key: PropertyKey) : void;

  /**
   * Get the return value, if it's available.
   */
  getReturnValue() : [false, undefined] | [true, ReturnType<MethodType>];

  /**
   * Set the return value.  Write this as `return setReturnValue(...);`.
   *
   * @param value - The value to return.  Only callable once.
   */
  setReturnValue(value: ReturnType<MethodType>) : void;

  readonly entryPoint: ThisClassType;
}

// This is generated.  I put it here for illustration.
export type PassThroughArgumentType<
  MethodType extends AnyFunction
> = PassThroughType<
  NumberStringType,
  MethodType,
  ExtendedEntryPoint
>;
```

Some sample code:

```typescript
export default class ExampleComponent implements PassThroughClassType
{
  repeatForward(
    __passThrough__: PassThroughArgumentType<NumberStringType["repeatForward"]>,
    s: string,
    n: number
  ) : void
  {
    if ((__passThrough__.entryPoint).isLogging())
    {
      const rv = __passThrough__.callTarget("logEntry");
      // Please don't set modifiedArguments unless you absolutely have to.
      // This is effectively replacing existing arguments, which ESLint might warn you against anyway.
      /** @see {@link https://eslint.org/docs/latest/rules/no-param-reassign} */
      [s, n] = __passThrough__.modifiedArguments;
    }

    return __passThrough__.setReturnValue(s.repeat(n));
  }

  repeatBack(
    __passThrough__: PassThroughArgumentType<NumberStringType["repeatBack"]>,
    n: number,
    s: string
  ) : void
  {
    void(__passThrough__);
    void(n);
    void(s);
    throw new Error("not yetimplemented");
  }
}

```

`__passThrough__.entryPoint` represents the `this` value in an integrated class, while `.callTarget("logEntry")` shows how we can hand off to another component class.  If the other component replaces the arguments (again, this risks side effects), we can pick up the change right away.

## Project configuration

Cross-stitch supports a particular configuration as JSON.  (Comments not supported.)

```JSON with Comments
[
  {
    /* Versioning of schemas. */
    "schemaDate": 20221027,

    "keys": {
      /* The key ("_Spy") defines a component name.
       * The "file" field defines the location of a module exporting a default class
       * implementing the pass-through class type.
       * The "type" field may be removed in a future build.
       *
       * The "setReturn" field must be one of three values:
       * - "never" indicating the component public methods never return a value.
       * - "may" for component public methods sometimes returning a value.
       * - "must" for component public methods always returning a value.
       *
       * The "role" must be one of several values:
       * - "precondition" for debug-only assertion checks run before any main-body code.
       * - "checkArguments" for argument validation before any main-body code.
       * - "body" for a main-body code section.  This is the only one where "setReturn" may be "must" or "may".
       * - "bodyAssert" for debug-only main-body code.
       * - "checkReturn" for return-value validation after main-body code.
       * - "postcondition" for debug-only assertion checks run after any main-body code.
       *
       * Typically, this is a component you write.
       */
      "_Spy": {
        "type": "component",
        "file": "../spec-generated/project/PassThrough_JasmineSpy.mjs",
        "role": "body",
        "setReturn": "may"
      },

      /* The ComponentClassGenerator provides two base classes you can inherit from
       * for convenience.  This one automatically throws from every method, in
       * case you forgot to implement a method.
       */
      "NotImplemented": {
        "type": "component",
        "file": "../spec-generated/project/generated/PassThrough_NotImplemented.mjs",
        "role": "body",
        "setReturn": "never"
      },

      /* This provides all the methods as no-op, so if you forget to implement a method,
         or you want a partial interface implementation, you can use this.
       */
      "Continue": {
        "type": "component",
        "file": "../spec-generated/project/generated/PassThrough_Continue.mjs",
        "role": "body",
        "setReturn": "never"
      },

      /* This provides a simple architecture for defining sequences.
       */
      "Continue_to_Spy": {
        "type": "sequence",
        "subkeys": [
          "Continue",
          "_Spy"
        ]
      }
    },

    /* This identifies the starting component for all calls into the entry-point class. */
    "startComponent": "_Spy",

    "componentGenerator": {
      /* Where the source file is, relative to the JSON file. */
      "sourceTypeLocation": "NumberStringType.mts",

      /* The type alias to implement. */
      "sourceTypeAlias": "NumberStringType",

      /* The directory to generate code into, relative to the JSON file. */
      "targetDirLocation": "../spec-generated/project/generated",

      /* The base class name for generated code. */
      "baseClassName": "NumberStringClass",

      /* The type alias of the entry point.  Extends sourceTypeAlias. */
      "entryTypeAlias": "NumberStringType"
    }
  },

  {
    // You can specify several build projects in parallel here, each following the above format.
  }
]
```

## Code generation

```typescript
await ProjectDriver(
  path.join(parentDir, "project.json")
);
```

This will generate several files.  

- For your use:
  - `BaseClass.mts` for a stub not-implemented class from [`TypeToClass`](../_04a_ts-morph_utilities/)
  - `KeyToComponentMap_Base.mts`, which exports a `InstanceToComponentMap` class.  
    - This class provides API to define components, sequences of components, and which component key is the starting point.
    - This module is also where `PassThroughArgument` instances, which implement `PassThroughType`, come from.
  - `EntryClass.mts` implementing your original type (in examples above, `NumberStringType`) to directly invoke a component class's equivalent method.  I recommend subclassing this for additional properties.
  - `PassThrough_Continue.mts` as a base class for component classes.  Use this when you want to allow methods to not be implemented.
  - `PassThrough_NotImplemented.mts` as a base class for component classes.  Use this when you _want_ to throw for methods you haven't implemented.
- For internal use:
  - `Common.mts` for shared TypeScript types.
  - `PassThroughClassType.mts` defines several types and the `ComponentMap`, which loads the component classes.  
  - `PassThroughSupport.mts` defines the generic types for component classes.

## Tying components together

The JSON format defines components.  Decorators (via [our decorators namespace code](../_03_decorators_namespace/)) will define sequences of components.  (Technically, I have that implemented now in the JSON, but that approach is not supported, and I will remove it as the decorators mature.)

## A more complete example

### project.json

```json
[
  {
    "schemaDate": 20221027,

    "keys": {
      "mainComponent": {
        "type": "component",
        "file": "MainComponent.mjs",
        "role": "body",
        "setReturn": "must"
      },

      "logEntry": {
        "type": "component",
        "file": "LoggingComponent.mjs",
        "role": "precondition",
        "setReturn": "never"
      },

      "logLeave": {
        "type": "component",
        "file": "LoggingComponent.mjs",
        "role": "postcondition",
        "setReturn": "never"
      },

      "main": {
        "type": "sequence",
        "subkeys": ["logEntry", "mainComponent", "logLeave"]
      }
    },

    "startComponent": "main",

    "componentGenerator": {
      "sourceTypeLocation": "NumberStringType.mts",
      "sourceTypeAlias": "NumberStringType",
      "targetDirLocation": "../spec-generated/project/generated",
      "baseClassName": "NumberStringClass",
      "entryTypeAlias": "NumberStringType"
    }
  }
]
```

### FullClass.mts

```typescript
import EntryClass from "./generated/EntryClass.mts";
import InstanceToComponentMap from "./generated/KeyToComponentMap_Base.mjs";
import type { NumberStringType } from "./generated/NumberStringType.mts";

import { Console } from "console";

export default class FullClass extends EntryClass
{
  readonly #console: Console;

  constructor(
    console: Console,
  )
  {
    this.#console = console;
  }

  log(isBefore: boolean, message: string) : void
  {
    this.#console.log((isBefore ? "enter" : "leave") + " " + message);
  }
}
```

### MainComponent.mts

```typescript
import ComponentBase from "./generated/PassThrough_Continue.mjs";
import type { PassThroughArgumentType } from "./generated/PassThroughClassType.mjs";

export default class MainClass extends ComponentBase
{
  repeatForward(
    __passThrough__: PassThroughArgumentType<NumberStringType["repeatForward"]>,
    s: string,
    n: number
  ) : void
  {
    __passThrough__.callTarget("logEntry");
    __passThrough__.setReturnValue(s.repeat(n));
    __passThrough__.callTarget("logLeave");
  }

  repeatBack(
    __passThrough__: PassThroughArgumentType<NumberStringType["repeatBack"]>,
    n: number,
    s: string
  ) : void
  {
    __passThrough__.callTarget("logEntry");
    __passThrough__.setReturnValue(s.repeat(n));
    __passThrough__.callTarget("logLeave");
  }
}
```

### LoggingComponent.mts

```typescript
import ComponentBase from "./generated/PassThrough_Continue.mjs";
import type { PassThroughArgumentType } from "./generated/PassThroughClassType.mjs";

export default class LoggingClass extends ComponentBase
{
  repeatForward(
    __passThrough__: PassThroughArgumentType<NumberStringType["repeatForward"]>,
    s: string,
    n: number
  ) : void
  {
    __passThrough__.entryPoint.log("repeatForward");
  }

  repeatBack(
    __passThrough__: PassThroughArgumentType<NumberStringType, NumberStringType["repeatBack"]>,
    n: number,
    s: string
  ) : void
  {
    __passThrough__.entryPoint.log("repeatBack");
  }
}
```

### build.mts

```typescript
await ProjectDriver(path.join(parentDir, "project.json"));
```

### spec.mts

```typescript
import FullClass from "../source/integration.mts";
import { Console } from "console";

describe("FullClass", () => {
  let instance;
  beforeEach(() => instance = new FullClass(new Console));

  it("repeatForward works", () => {
    expect(instance.repeatForward("foo", 3)).toBe("foofoofoo");
  });
});
```
