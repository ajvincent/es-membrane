import { runModule } from "./utilities/runModule.mjs";

await runModule("./build/source/main.mjs", ["build:rebuild"]);
await runModule("./build/source/main.mjs", process.argv.slice(2));
