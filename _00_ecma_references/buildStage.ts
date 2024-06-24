import { BuildPromiseSet } from "#utilities/source/BuildPromise.js";
import { runModule } from "#utilities/source/runModule.js";
import runJasmine from "#utilities/source/runJasmine.js";

const BPSet = new BuildPromiseSet;

{ // jasmine
  const target = BPSet.get("jasmine");

  target.addTask(async () => {
    console.log("starting jasmine");
    await runJasmine("./spec/support/jasmine.json", "build");
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
