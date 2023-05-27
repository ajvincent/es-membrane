# Stub class generation (or "metaprogramming, part 2")

To support the [aspect weaving](../_03_aspect_weaving/README.md) infrastructure for this project, I need to take an existing interface, containing only concrete methods, and modify it:

- Sometimes I'll change the return type.
- Sometimes I'll insert extra arguments at the beginning of each method.  
- I will also want "transition types", with methods having arguments of this form:
  1. The original arguments.
  2. Inserted "middle" arguments, such as a modified "this" argument.
  3. Copies of the original argument _types_, to later call through the original API.

I admit the motivation for transition types isn't clear here.  Think of these as mapping the original arguments of a function, including `this`, to a matching API on a different object.  In the `Proxy` trap-handler case, it's mapping from one object graph (where `this` is a `ProxyHandler`) to another (where `this` is most likely `Reflect`, or occasionally another `ProxyHandler`).  The target object graph may need to be an argument in the transition type.  The remapped trap arguments definitely need to be arguments in the transition type, after the source graph trap's arguments.

I'm pretty sure this will be very handy later on.

TypeScript supports [creating types from existing types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html), so that's no problem.  That said, I also expect to need _stub classes_ implementing these derived types.  That's a _huge_ problem.

This subproject exists to solve the stub classes problem, at least for the es-membrane project.

## Leveraging [ts-morph](https://ts-morph.com) and [code-block-writer](https://github.com/dsherret/code-block-writer)

I use ts-morph as input, providing an existing TypeScript [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) from an existing type.  (In my tests, I use an example, [NumberStringType](./fixtures/types/NumberStringType.d.mts)).  For output, I use several instances of code-block-writer to nicely format the source code I generate.

In the middle is [ConfigureStub](./source/base/baseStub.mts).  It provides a very simple API:

1. `configureStub` defines fundamental settings, like a constructor.
2. `addImport` defines module imports.
3. `buildClass()` invokes several protected methods to construct the exported class's source.
4. `write()` commits the final file to the file system.

Users of this class must subclass it.  There are several protected fields for subclasses to use:

- `static pairedWrite()`, a helper for `CodeBlockWriter` instances.
- `classWriter` for directly writing class source code, if necessary.
- `getExtendsAndImplements()`, for the `extends` and `implements` clauses.
- `methodTrap()`, for modifying method arguments and return types, or inserting code into a class between methods
- `buildMethodBody()`, for filling the body of a method
- `voidArguments()`, for writing `void(foo);` statements
- `writeBeforeClass()`, to provide code before the class but after the module imports
- `writeAfterClass()`, to provide code after the class (example: `Object.seal(MyClass.prototype);`)

## Using decorators for ordered [method overrides](https://www.typescriptlang.org/docs/handbook/2/classes.html#overriding-methods)

As I establish in the [previous stage](../_01_stage_utilities/README.md), I can use decorators to create mixin classes.  Each decorator has a specific task for creating a stub class.  At the base functionality level:

- [voidClass](./source/base/decorators/voidClass.mts) calls `voidArguments()` for remaining arguments, and converts the return type of each method to `void`.
- [prependReturn](./source/base/decorators/prependReturn.mts) inserts an argument at the start of each method's argument list, matching the return type.
- [notImplemented](./source//base/decorators/notImplemented.mts) gives you a class where every method throws a `"Not implemented yet!"` exception.
- [spyClass](./source/base/decorators/spyClass.mts) provides API's for accessing Jasmine spies.

For the "transition types" I mentioned at the start of this article, I have four special-purpose subclass decorators:

- [defineExtraParamsShort](./source/transitions/decorators/defineExtraParamsShort.mts) manages the insertion of extra middle and "copy-to-tail" parameters into each method.
- [buildMethodBody](./source/transitions/decorators/buildMethodBody.mts) delegates filling out the body of a method to the user.  (Basically, exposing the protected `buildMethodBody()` method to the user via a callback.)
- [headCall](./source/transitions/decorators/headCall.mts) defines a class to convert from a non-transition class to a transition class.
- [tailCall](./source/transitions/decorators/tailCall.mts) defines a class to invoke a non-transition class's traps with the remapped arguments of the transition type.

I can fine-tune the stub class generation by specifying the ordering of decorators.  Each decorator will create a subclass which could call base class methods for `methodTrap()` and `buildMethodBody()`.

## Building a consistent set of stub classes

The [full-set.mts](./source/full-set.mts) module takes all the mixin classes and invokes them with common arguments.  This means one module drives the creation of several stub classes, from a common base type, and where each class fulfills an unique support role.  Most of the stub classes will be base classes.

You can find the mixin definitions in [source/base](source/base) and [source/transitions](source/transitions).
