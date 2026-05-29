# Design Approach

The `ProxyHandler` interface thirteen trap methods, generally following the pattern of:

1. Define a "shadow" `target` parameter for accounting purposes (invariant checking, etc.).
2. Pass in the arguments for the trap, which ultimately the `Reflect` object's equivalent trap implements.
3. Return the value we get from `Reflect`'s trap.

With es-membrane, I have a modified `ProxyHandler` interface, [ObjectGraphHandlerIfc](./source/generated/types/ObjectGraphHandlerIfc.d.ts).  Each trap gets additional arguments specific to the "next" object graph.  This is almost always in the "origin" object graph for the shadow target.  The idea is to separate operations on values in one object graph from operations on another.  Each trap includes another argument, `nextGraphKey`, to indicate where we are going.

## `ObjectGraphTailHandler` and class decorators

For this reason, I provide a base class, `ObjectGraphTailHandler`, which simply calls the `Reflect` API on the next object graph's value.  This class I generate explicitly to do that and nothing else.

Working backwards, we clearly need to wrap any returned values in proxies which belongs to the calling object graph.  Either defining this behavior directly on the tail handler, or on a subclass, would be necessary.  The first version of es-membrane tried to define this behavior directly, with the result being a non-maintainable, non-unit-testable, difficult-to-read mess.  Sure, it worked, but it was very easy to break with simple bug fixes.

This version of es-membrane is taking the subclass approach, leveraging [ECMAScript decorators](https://github.com/tc39/proposal-decorators) to build mix-in classes.  This version I've written in TypeScript, which since version 5.0 has correctly supported this standard (with some type quirks: see [mixin-decorators](../../mixin-decorators)).  I can use these mix-in decorators to create unit-testable handlers, which each have one aspect to implement well.  Then the _final_ object graph handler class will be a composition of several of these decorators on the `ObjectGraphTailHandler` class.

When I first pitched this idea to several colleagues in an online forum, they were worried about performance concerns - and rightly so.  Decorators invariably add overhead, particularly when I'm layering subclass upon subclass.  I intend to resolve this with a later build stage, "remodeling", which will collect the subclasses together and assemble one class to integrate them all together.  (I already have `ts-morph` and my [`ts-morph-structures`](../../ts-morph-structures) project, so why not?)

Some of the subclass decorators I intend to use:

- `wrapReturnValues`, which does the return value wrapping
- `updateShadowTarget`, which ensures the shadow target passes ECMAScript invariants
- `revokedInFlight`, which handles a sudden revocation of the object graph during processing.

Decorators which apply "distortions" (modifying what the proxy traps expose) will come over time, possibly in a later build stage.  At this time (May 28, 2026), I'm not ready to explore them yet.

## Providing the "next object graph" values to the tail handler

So I still have to _get_ values for the next object graph from equivalent values we pass in from this object graph.  [`ConvertingHeadProxyHandler`](./source/generated/ConvertingHeadProxyHandler.ts) does this, calling on a [`MembraneInternalIfc`](./source/types/MembraneInternalIfc.d.ts) to do the conversions for us.  The actual implementation of this interface is in future build stages such as [`mirror_membranes`](../mirror_membranes/).

## The object graph itself

One mistake in the first es-membrane design was tightly coupling the object graph _proxy handlers_ with the object graph itself.  This time, I'm explicitly creating an [`ObjectGraphHead`](./source/ObjectGraphHead.ts) class for the membrane to own and talk to, which manages and creates proxies for the object graph.

It's the `ObjectGraphHead` that drives the graph-specific operations.  The membrane often just forwards calls to it.
