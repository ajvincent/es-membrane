# Stage 2 snapshot and tests

This directory is to ensure the snapshot from the previous directory works.  There are three main tasks:

1. Copy the snapshot from [the integration dist folder](../stage_2_integration/)
2. Run [a battery of tests](./spec-snapshot/) against the [resulting snapshot](./snapshot/), the [exported module](../dist/exports.js) and the [exported type definitions](../dist/exports.d.ts).
3. Run eslint against the snapshot and our test files.

I have organized the tests mostly matching the snapshot's files, with a larger emphasis on the code I wrote from hand in stage 2's integration folder.  This is because they are truly implementing new features which ts-morph doesn't provide, and I need to be _absolutely_ sure they work.

One test which diverges from this pattern is [the import-dist test](./spec-snapshot/build-checks/import-dist.ts).  This test exists solely to make sure _other_ npm-based projects can import this one as a supporting library.  In other words, it guarantees I'm _shipping_ good code. :shipit:

The standard structures and standard decorators get less testing here than you might expect, for two reasons.

1. These are supporting classes implementing structures for ts-morph itself.  If ts-morph generates bad outputs from them, [it's more likely to be a bug in ts-morph](https://github.com/dsherret/ts-morph/issues/1501) than here.
2. Stage _3_ uses the structure classes (and the rest of the public tools of this package) to build another complete snapshot of the structure classes and compare against this directory's snapshot.  It's a pretty brutal integration test of the snapshot, and I fixed several bugs in the snapshot which the new build revealed.

The other interesting directory here is the [test fixtures](./fixtures/) directory.  These files attempt to capture every (relevant) form of valid TypeScript node for analysis.  It's probably not complete, but it has quite a bit of coverage.

JSX structures are weakly supported here, only because I don't know _how_ to effectively test them.  So, buyer beware there.  Help most certainly welcomed to fill in the gaps!
