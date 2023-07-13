# Aspect-oriented programming: stub classes

This stage provides tools for building stub classes from a known base type:

- a "not implemented" class, where every method throws an exception.
- an "invariants" sub-class, where every method call runs a set of user-defined class invariants.
- a set of "transition" classes (experimental, definitely not locked in), providing additional arguments
  - a "head" class, creating extra "middle" arguments and a copy of the original arguments ("tail" arguments) before passing off to a class requiring them
  - a "not-implemented" transition class, again throwing exceptions for every method, with the extra arguments
  - a "tail" class, for dropping the "head" and "middle" arguments and forwarding the "tail" arguments to another class

The transition classes are NOT stable.  They are definitely an internal tool, which I thought I had a defined need for.  I think I still do, but the actual requirements are not clear at this time (July 4, 2023).

TypeScript supports [creating types from existing types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html), so that's no problem.  That said, I also expect to need _stub classes_ implementing these derived types.  That's a _huge_ problem.

This subproject exists to solve the stub classes problem, at least for the es-membrane project.

## Leveraging [ts-morph](https://ts-morph.com) and [code-block-writer](https://github.com/dsherret/code-block-writer)

I use ts-morph as input, providing an existing TypeScript [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) from an existing type.  (In my tests, I use an example, [NumberStringType](./fixtures/types/NumberStringType.d.mts)).  For output, I use several instances of code-block-writer to nicely format the source code I generate.

In the middle is [AspectsStubBase](./source/base/baseStub.mts).  It provides a very simple API:

1. `configureStub` defines fundamental settings, like a constructor.
2. `getClassName()` tells you (more specifically, [subclass decorators](../_02_mixin_decorators/) of the stub base) what the current class name is.
3. `getPathToClassFile()` reports where the aspects stub will create the class file.
4. `addImport()` defines module imports.
5. `wrapInFunction()` allows you to wrap the generated class in a function.  (My use case is passing in a class which the generated class will be a sub-class of.)
6. `buildClass()` invokes several protected methods to construct the exported class's source.
7. `write()` commits the final file to the file system.

Users of this class must subclass it.  There are several protected fields for subclasses to use:

- `static pairedWrite()`, a helper for `CodeBlockWriter` instances.
- `classWriter` for directly writing class source code, if necessary.
- `insertAdditionalMethodsTrap()` for adding new methods to build.
- `getExtendsAndImplementsTrap()`, for the `extends` and `implements` clauses.
- `methodDeclarationTrap()`, for modifying method arguments and return types, or inserting code into a class between methods
- `buildMethodBodyTrap()`, for filling the body of a method
- `voidArguments()`, for writing `void(foo);` statements
- `writeBeforeExportTrap()`, to provide code before the class but after the module imports
- `writeAfterExportTrap()`, to provide code after the class (example: `Object.seal(MyClass.prototype);`)

## Using decorators for ordered [method overrides](https://www.typescriptlang.org/docs/handbook/2/classes.html#overriding-methods)

As I establish in the [previous stage](../_02_mixin_decorators/README.md), I can use decorators to create mixin classes.  Each decorator has a specific task for creating a stub class.  At the base functionality level:

- [`notImplemented`](./source/decorators/notImplemented.mts) gives you a class where every method throws a `"Not implemented yet!"` exception.
- [`classInvariants`](./source/decorators/classInvariants.mts) enforces class invariants.
- [`methodDecorators`](./source/decorators/methodDecorators.mts) allows for creating a stub class with decorators on individual methods.  Each method calls the super-class's equivalent method for the return value.  This is more experimental than a "known need".

For the "transition types" I mentioned at the start of this article, I have three special-purpose subclass decorators:

- [`defineExtraParamsShort`](./source/decorators/defineExtraParamsShort.mts) manages the insertion of extra middle and "copy-to-tail" parameters into each method.
- [`headCall`](./source/decorators/headCall.mts) defines a class to convert from a non-transition class to a transition class.
- [`tailCall`](./source/decorators/tailCall.mts) defines a class to invoke a non-transition class's traps with the remapped arguments of the transition type.

## Mixins

I can fine-tune the stub class generation by specifying the ordering of decorators.  Each decorator will create a subclass which could call base class methods for `methodDelcarationTrap()` and `buildMethodBodyTrap()`.

The [mixins](./source/mixins) directory creates the stub-building classes, which I then collect into [`StubMap`](./source/StubMap.mts).  To build a complete set from a common configuration, I provide [`StubClassSet`](./source/StubClassSet.mts).

Individual mixin stub generators correspond to specific decorators:

- [`NotImplementedBase`](./source/mixins/NotImplementedBase.mts) builds a "not-implemented" class.
- [`ClassInvariantsWrapperStub`](./source/mixins/ClassInvariantsWrapperStub.mts) creates a function to apply class invariants to a class.
- [`AddMethodDecoratorsStub`](./source/mixins/AddMethodDecoratorsStub.mts) creates a class from a base class, a set of module imports and a set of method decorators per method.  Experimental.

## Internal utilities

- [`aspectTypeImport`](./source/utilities/aspectTypeImport.mts) provides a fast stubs-type import method.
- [`extractType`](./source/utilities/extractType.mts) converts a ts-morph `string | WriterFunction` type into a string, and potentially feeds it to a `CodeBlockWriter`.
- [`serializeParameter`](./source/utilities/serializeParameter.mts) stringifes a ts-morph parameter.

## Internal types

- [`AspectsStubDecorator`](./source/types/AspectsStubDecorator.d.mts) is a short-hand for a [subclass decorator type](../_02_mixin_decorators/source/types/SubclassDecorator.d.mts) specific to aspect stub classes.
- [`MethodDecoratorsOfClass`](./source/types/MethodDecoratorsOfClass.d.mts) defines method decorators and module imports for a stub class, to configure the `methodDecorators` stub decorator above.  (Yes, we're defining decorators using decorators.)
- [`AddImport`](./source/types/AddImport.d.mts) is a supporting type for `MethodDecoratorsOrClass`.
- [`StubClassSetConfiguration`](./source/types/StubClassSetConfiguration.d.mts) defines a configuration object shape for stub class sets.
- [`ts-morph-native`](./source/types/ts-morph-native.d.mts) provides type aliases for ts-morph methods parameters, and type parameters.
- For transitions:
  - [`paramBuilders`](./source/types/paramBuilders.d.mts) is for "transition head" classes to build middle and tail parameters.
  - [`paramRenamer`](./source/types/paramRenamer.d.mts) is for creating a new tail parameter of the same type as a known head parameter.
  - [`TransitionInterface`](./source/types/TransitionInterface.d.mts) defines the type for "middle" and "tail" classes.

## Checklist for adding something new

- [ ] Add appropriate types in the [types](./source/types/) directory.
- [ ] Add single-purpose decorators in the [decorators](./source/decorators/) directory.
- [ ] Add mixin stubs using the decorators in the [mixins](./source/mixins/) directory.
- [ ] Add the mix-ins to [the stub map](./source/StubMap.mts).
- [ ] Update the [stub class set configuration](./source/types/StubClassSetConfiguration.d.mts) and add a builder to [the stub class set](./source/StubClassSet.mts).
- [ ] Add a new test in [spec](./spec/) using [`AsyncSpecModules`](../_01_stage_utilities/source/AsyncSpecModules.mts) to import generated code from `spec-generated`.
- [ ] Documentation in this README file.
- [ ] Code documentation using [`tsdoc`](https://tsdoc.org/) format.
