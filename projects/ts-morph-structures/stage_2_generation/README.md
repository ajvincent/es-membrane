# Building a structures set from the prototype snapshot

In the spirit of [self-hosting compilers](https://en.wikipedia.org/wiki/Bootstrapping_(compilers)), this directory's primary run-time purpose is to create the stage 2 snapshot code which derives from ts-morph interfaces.  In a nutshell, the major tasks are:

- Read ts-morph's type definitions file into [special-purpose data classes](./build/structureMeta/DataClasses.ts), which describe the structure unions, specific structure interfaces and "mixin interfaces"
- Create modules for class decorator functions and interfaces, based on the forthcoming ECMAScript decorators standard, for shared functionality between structure interfaces
- Create modules structure classes and interfaces, using my [mixin-decorators](https://github.com/ajvincent/mixin-decorators) project
- Create export modules for both public exports ("what we ship") and internal exports ("what we use but don't want others to use")

Notably you will _not_ find the exported type structure classes here.  These live in [the stage 2 integration directory](../stage_2_integration/), which combines the module code I generate in this directory with the hand-written code to complete the stage 2 snapshot.

## Decorator and structure hooks

I created a simple API to [add hooks for each decorator and structure class](./build/StructureDictionaries.ts).  Each hook implements a simple type, to do one task towards building a module file.  It's very much an assembly line approach.  Some of the tasks are:

- defining the class interfaces
- defining the standard class properties for each structure
- `.toJSON()` support
- [TSDoc](https://www.tsdoc.org) comments
- type structure support
- support for cloning structures
- writing the source file

The actual driver of all this is [`BuildClassesDriver`](./build/BuildClassesDriver.ts).

## Public and internal exports

We have to write our public exports file before all the exports necessarily exist.  Ditto for the internal exports, which are (hopefully) not exported to users.  So I include the [export managers](./build/utilities/public/ExportManager.ts) for these through each decorator and structure hook, so they can add the values they each export along the way.

That doesn't cover all of the exports, though.  I have [a special module for defining additional exports](./build/publicAndInternalExports.ts) after the hooks have done their work.  In particular, these hand-written exports belong to the stage 2 integration directory.
