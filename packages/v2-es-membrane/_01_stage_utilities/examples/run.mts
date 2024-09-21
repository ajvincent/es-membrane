import { doubleArray } from "./source/AsyncModule.mjs";

export default async function() : Promise<void> {
  console.log(await doubleArray.run());
}
