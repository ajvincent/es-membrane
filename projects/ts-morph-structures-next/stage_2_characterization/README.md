# This is for confirming the behavior of ts-morph's `getStructure()` code

When it comes to what ts-morph does, I need to capture for myself some of its behavior.  For instance:

- block statements: are they truly opaque?
- statements without structures: do they appear as separate strings or as one string in a statements array?

That sort of thing.  This directory is Jasmine tests to establish the baselines I have to work with.
