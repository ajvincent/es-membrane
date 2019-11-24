# Proxy handlers

Each JavaScript file here describes a Proxy handler for specific tasks.  In the grand design of "do one thing only and do it well", each file represents a unit-testable component that performs one basic operation for proxies.

There are several files in this directory describing ProxyHandler objects.  The most important ProxyHandler is MembraneProxyHandlers.LinkedListNode, which should be the prototype for building new ProxyHandlers.

## The various types of ProxyHandlers
### Base

A minimalist ProxyHandler, to implement all the ProxyHandler traps as exception-throwing methods.  Basically, it's a base class.

### Forwarding

This one simply forwards Proxy trap calls to a "nextHandler" property's matching traps.

### LinkedList

A ProxyHandler which links several Proxy handlers in a sequence.  I use this mainly for integrating the component Proxy handlers into a single Proxy handler.

### LinkedListNode

The real base class for everything you should realistically do with a Proxy handler.  See source/ProxyHandlers/Tracing.js for a good example on how to write one.

### Master

This ProxyHandler constructor is for Membrane proxies overall.  It's basically a LinkedList handler of LinkedList handlers, each of which has their own specific task.  There are four named LinkedList instances under each Master:
* "outbound", for invariants on exiting an object graph
* "wrapping", for converting from one object graph to another
* "distortions", for applying distortions to a membrane proxy
* "inbound", for invariants on entering an object graph

### Tracing

This is a debugging ProxyHandler.  Production code shouldn't use this, but if you need to figure out how you're getting in and out of a particular ProxyHandler, this is useful.

## How to insert a ProxyHandler

```javascript
// assuming master is an instance of MembraneProxyHandlers.Master

const subList = master.getNodeByName(/* the name of the subsidiary LinkedList */);
const subHandler = subList.buildNode(name, "constructorName", ...argsToPassIn);
// set rules on subHandler as desired
subList.insertNode(precedingNodeName, subHandler);
```
