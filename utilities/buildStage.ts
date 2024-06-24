import { BuildPromiseSet } from "#utilities/source/BuildPromise.js";
import { runModule } from "#utilities/source/runModule.js";
import runJasmine from "#utilities/source/runJasmine.js";

const BPSet = new BuildPromiseSet;

// #region utilities
{ // utilities:jasmine
  const target = BPSet.get("utilities:jasmine");

  target.addTask(async () => {
    console.log("starting utilities:jasmine");
    await runJasmine("./spec/support/jasmine.json", "build");
  });
}

`
{ // utilities:eslint
  const target = BPSet.get("utilities:eslint");

  const args = [
    "-c", "../.eslintrc.json",
    "--max-warnings=0",
  ];

  args.push("**/*.ts");
  args.push("../build.ts");

  target.addTask(async () => {
    console.log("starting utilities:eslint");
    await runModule("../node_modules/eslint/bin/eslint.js", args);
  });
}
`;

BPSet.markReady();
BPSet.main.addSubtarget("utilities:jasmine");
/*
BPSet.main.addSubtarget("utilities:eslint");
*/

await BPSet.main.run();
