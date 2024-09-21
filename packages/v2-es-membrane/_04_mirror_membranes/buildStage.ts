import {
  BuildPromiseSet,
} from "#build-utilities/source/BuildPromise.js";

import runJasmine from "#build-utilities/source/runJasmine.js";

const BPSet = new BuildPromiseSet;

{ // test
  const target = BPSet.get("test");

  target.addTask(async () => {
    console.log("starting _04_mirror_membranes: jasmine");
    await runJasmine("./spec/support/jasmine.json", "mirror_membranes");
  });
}

BPSet.markReady();
{
  BPSet.main.addSubtarget("test");
  /*
  // at the end to allow for debugging before this
  BPSet.main.addSubtarget("eslint");
  */
}
await BPSet.main.run();
export default Promise.resolve();
