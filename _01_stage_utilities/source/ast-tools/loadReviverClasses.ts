import {
  PromiseAllParallel,
  SingletonPromise,
} from "../PromiseTypes.mjs";

export default new SingletonPromise(async (): Promise<void> => {
  const jsonClassFiles = [
    "./SourceClass.js",
    "./IdentifierOwners.js",
  ];

  await PromiseAllParallel(jsonClassFiles, (f) => import(f));
});
