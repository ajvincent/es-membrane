# ShadowProxyHandler, and converting to and from ProxyHandler

ProxyHandlers have 13 traps, each with specific fields for a target, arguments, a descriptor, etc.

However, the shadow target is a tracking mechanism for an actual value.  It would be helpful to have
an equivalent type definition for the actual target, with arguments for converting from one object
graph to another.

This is the purpose of the `ShadowProxyHandler<T>` type, which carries these additional arguments.

`ShadowProxyHandlerAspect<T>` rewrites the `ShadowProxyHandler<T>` type, so every trap returns void.
This will be useful for aspect-oriented programming, where each aspect class implements one part of
the membrane (usually preconditions, postconditions, class invariants, etc.)

`ShadowHeadHandler` converts from `Required<ProxyHandler<T>>` to `ShadowProxyHandler<T>`, with the
assistance of two `ObjectGraphStub` instances to (maybe) convert arguments from one object graph to
another.

`TailHandler` converts from `ShadowProxyHandler<T>` to `Required<ProxyHandler<T>>` by invoking the
`nextHandler` argument with the `nextTarget` and `nextArgArray`, `nextThisArg`, `nextDescriptor`,
etc. arguments.

`ObjectGraphStub` provides a basic interface, which may change, for mapping shadow targets, handlers
and arguments to the target graph, and return values back to the source graph.
