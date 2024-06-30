import { BuildPromiseSet } from "#build-utilities/source/BuildPromise.js";
import { runModule } from "#build-utilities/source/runModule.js";
import runJasmine from "#build-utilities/source/runJasmine.js";

const BPSet = new BuildPromiseSet;

{ // jasmine
  const target = BPSet.get("jasmine");

  target.addTask(async () => {
    console.log("beginning _00_ecma_references:jasmine");
    await runJasmine("./spec/support/jasmine.json", "build");
    console.log("completed _00_ecma_references:jasmine");
  });
}

`
{ // eslint
  const target = BPSet.get("eslint");

  const args = [
    "-c", "../.eslintrc.json",
    "--max-warnings=0",
  ];

  args.push("**/*.ts");
  args.push("../build.ts");

  target.addTask(async () => {
    console.log("starting eslint");
    await runModule("../node_modules/eslint/bin/eslint.js", args);
  });
}
`;

BPSet.markReady();
BPSet.main.addSubtarget("jasmine");
/*
BPSet.main.addSubtarget("eslint");
*/

await BPSet.main.run();
