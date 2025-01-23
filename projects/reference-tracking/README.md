# Reference tracking tools

MDN states the question of whether an object has _zero_ strong references to it, and is subject to garbage collection, is [undecidable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_management#release_when_the_memory_is_not_needed_anymore).  I have struggled with this assertion, before realizing "is this object unreachable?" isn't really the question I'm trying to answer.  The question I seek to resolve is "Is this object unreachable _from this finite set of known objects_?".

That's what this library is about: searching a tree of references to see what paths there are to a target value from another value.  Or, from a larger perspective, _is my code holding strong references it shouldn't be?_

Now, obviously there are some challenges:

- Private class properties are not reachable via `Reflect.ownKeys()`
- Several built-in classes don't expose internal slots or relationships (for very good reason!)
- A value might be held only if a specific set of objects holds them (i.e. a value in a `WeakMap` where the key is held, but the map itself isn't)
- Asynchronous code running in arbitrary order.  (I don't have a solution for that.)
- Some relationships are strongly held, others are weakly held.

Figuring out the answer to these questions requiries analyzing the relationships, which means we have to know about those relationships.  But to discover those relationships means, in several ways, we have to figure out what the code is actually going to do.  That requires either:

1. implementing large parts of a JavaScript engine (no thanks)
2. patching, compiling and running an existing engine (ugh)
3. intercepting the built-in API's and inserting traps (unsafe)

This library takes the third approach, with the idea of transforming source code and running it as a bundle in a separate location.  So we're going to get _creative_ in one sense... and _evil_ in another.  Simply put, this code is taking a risky path with existing TypeScript files, which is why I will sandbox it as much as possible.

In other words, **look, dude, these are hacks.**  Production code should _never even think_ about what I'm trying to do here, and should certainly _never publish_ what this code generates.

The safest option above would've been option 2, using [engine262](https://engine262.js.org/), which is a ECMAScript engine written to run in [Node](https://nodejs.org/en).  Maybe I'll end up patching and using engine262 to run my code in an in-memory sandbox.
