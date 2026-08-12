# Stage 3: Integrating hand-written code from stage 2 with the generated code of stage 3

This is really all I do here:

1. I copy the custom code from [stage 2's integration sources](../stage_2_integration/source/)
2. I [repeat the bundling process](./build/bundle.ts) to generate the distribution files.
3. I rebuild the internal ["structure-to-syntax" kind map](./build/structureToSyntax.ts).

No tests live here.

As for why I copy the hand-written files instead of recreating them from scratch:  they do not derive from anything in ts-morph.  In fact, they have nothing to derive from.  So there's no point trying to create structures, statements and module files for these.
