import {
  BuildPromiseSet,
} from "#build-utilities/source/BuildPromise.js";

import runJasmine from "#build-utilities/source/runJasmine.js";

import copyGenerated from "./build/copyGenerated.js";

const BPSet = new BuildPromiseSet;

{  // copyGenerated
  const target = BPSet.get("copyGenerated");
  target.addTask(async () => {
    console.log("starting _03_objectgraph_handlers: copy generated stubs");
    await copyGenerated();
  });
}

{ // test
  const target = BPSet.get("test");

  target.addTask(async () => {
    console.log("starting _03_objectgraph_handlers: jasmine");
    await runJasmine("./spec/support/jasmine.json", "objectgraph_handlers");
  });
}

BPSet.markReady();
{
  BPSet.main.addSubtarget("copyGenerated");
  BPSet.main.addSubtarget("test");
  /*
  // at the end to allow for debugging before this
  BPSet.main.addSubtarget("eslint");
  */
}
await BPSet.main.run();
export default Promise.resolve();
