import {
  BuildPromiseSet,
} from "#build-utilities/source/BuildPromise.js";

import runJasmine from "#build-utilities/source/runJasmine.js";

import copyGenerated from "./build/copyGenerated.js";

const BPSet = new BuildPromiseSet;

{  // copyGenerated
  const target = BPSet.get("copyGenerated");
  target.addTask(async () => {
    console.log("starting stage_2_snapshot:copyGenerated");
    await copyGenerated();
  });
}

{ // test
  const target = BPSet.get("test");

  target.addTask(async () => {
    console.log("starting stage_2_snapshot:jasmine");
    await runJasmine("./spec-snapshot/support/jasmine.json", "stage_two_test");
  });
}

BPSet.markReady();
{
  BPSet.main.addSubtarget("copyGenerated");
  /*
  BPSet.main.addSubtarget("test");
  // at the end to allow for debugging before this
  BPSet.main.addSubtarget("eslint");
  */
}
await BPSet.main.run();
export default Promise.resolve();
