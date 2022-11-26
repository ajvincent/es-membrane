import { doubleArray } from "./source/AsyncModule.mjs";

export default async function() {
  console.log(await doubleArray.run());
}
