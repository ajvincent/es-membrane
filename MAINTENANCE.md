# Maintaining dependencies

Keeping a monorepo up to date is non-trivial, but it's easier than updating _several_ different repositories.  Here's a series of commands to run, with the caveat that version numbers probably need to change.

## TODO

- @tsconfig/node18 => @tsconfig/node25?
-


## build-utilities

```bash
npm audit

# TypeScript, typescript-eslint
npm install -w projects/build-utilities --save-dev eslint @eslint/js typescript typescript-eslint

npm install -w projects/build-utilities --save-dev prettier

npm install -w projects/build-utilities --save-dev jasmine

pushd projects/build-utilities
npm run clean && npm run build && npm run test
popd
```

## mixin-decorators

There should hardly be anything here.  This is a tiny project.
