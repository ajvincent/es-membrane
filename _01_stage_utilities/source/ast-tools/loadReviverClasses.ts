/*
import * as SourceClasses from "./SourceClass.js"
import * as IdentifierClasses from "./IdentifierOwners.js";
void(SourceClasses);
void(IdentifierClasses);

export default Promise.resolve();
*/

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
