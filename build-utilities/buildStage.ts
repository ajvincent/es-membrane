import { BuildPromiseSet } from "#build-utilities/source/BuildPromise.js";
import { runModule } from "#build-utilities/source/runModule.js";
import runJasmine from "#build-utilities/source/runJasmine.js";

const BPSet = new BuildPromiseSet;

// #region utilities
{ // utilities:jasmine
  const target = BPSet.get("build-utilities:jasmine");

  target.addTask(async () => {
    console.log("starting build-utilities:jasmine");
    await runJasmine("./spec/support/jasmine.json", "build-utilities");
  });
}

`
{ // utilities:eslint
  const target = BPSet.get("build-utilities:eslint");

  const args = [
    "-c", "../.eslintrc.json",
    "--max-warnings=0",
  ];

  args.push("**/*.ts");
  args.push("../build.ts");

  target.addTask(async () => {
    console.log("starting build-utilities:eslint");
    await runModule("../node_modules/eslint/bin/eslint.js", args);
  });
}
`;

BPSet.markReady();
BPSet.main.addSubtarget("build-utilities:jasmine");
/*
BPSet.main.addSubtarget("build-utilities:eslint");
*/

await BPSet.main.run();
