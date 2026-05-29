# What are we doing here?

## Setting up interfaces and base classes for Object Graphs

In the next build directory ([`objectgraph_handlers`](../objectgraph_handlers/)), you'll see conversions between a standard `ProxyHandler` and a `ObjectGraphHandlerIfc` interface, which mirrors the arguments from one graph to another.

The idea is to make sure we never cross boundaries - that we always explicitly know which value comes from which graph.

This directory generates interfaces and a few basic classes to make the conversions seamless.
