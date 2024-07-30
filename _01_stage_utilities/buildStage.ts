import { BuildPromiseSet } from "#build-utilities/source/BuildPromise.js";
import saveBuiltinClassReferences from "./source/gc-static-analysis/builtin-classes.js";
import runJasmine from "#build-utilities/source/runJasmine.js";

const BPSet = new BuildPromiseSet;

{ // builtin-classes
  const target = BPSet.get("built-in classes");

  target.addTask(async () => {
    console.log("beginning _01_stage_utilities:built-in classes");
    await saveBuiltinClassReferences();
    console.log("completed _01_stage_utilities:built-in classes");
  });
}

{ // jasmine
  const target = BPSet.get("jasmine");

  target.addTask(async () => {
    console.log("beginning _01_stage_utilities:jasmine");
    await runJasmine("./spec/support/jasmine.json", "build");
    console.log("completed _01_stage_utilities:jasmine");
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
BPSet.main.addSubtarget("built-in classes");
BPSet.main.addSubtarget("jasmine");
/*
BPSet.main.addSubtarget("eslint");
*/

await BPSet.main.run();
