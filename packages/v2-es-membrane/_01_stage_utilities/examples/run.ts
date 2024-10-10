import { doubleArray } from "./source/AsyncModule.js";

export default async function() : Promise<void> {
  console.log(await doubleArray.run());
}
