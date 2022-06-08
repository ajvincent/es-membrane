import BPSet from "./targets.mjs";

const targets = process.argv.slice(2);
targets.forEach(t => BPSet.main.addSubtarget(t));
await BPSet.main.run();
