import path from "path";
import fs from "fs/promises";
import { openSync } from "fs";
import { fork } from "child_process";

const projectRoot = path.resolve();
const TSC = path.resolve(projectRoot, "node_modules/typescript/bin/tsc");

type TSCConfig = {
  files?: string[],
  extends?: string
};

const InvokeTSC =
{
  withConfigurationFile: async function(
    pathToConfig: string,
    pathToStdOut = ""
  ) : Promise<void>
  {
    pathToConfig = path.resolve(projectRoot, pathToConfig);

    let stdout: "inherit" | number = "inherit";
    if (pathToStdOut) {
      stdout = openSync(path.resolve(projectRoot, pathToStdOut), "w");
    }

    const args = [
      "--project", pathToConfig
    ]

    const child = fork(
      TSC,
      args,
      {
        stdio: ["ignore", stdout, "inherit", "ipc"]
      }
    );

    const p = new Promise<void>((resolve, reject) => {
      child.on("exit", (code: number) : void => {
        code ? reject(code) : resolve();
      });
    });

    try {
      await p;
    }
    catch (code) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      console.warn(await fs.readFile(pathToStdOut, {encoding: "utf-8"}));
      throw new Error(`Failed on "${TSC} ${args.join(" ")}" with code ${code as number}`);
    }
  },

  withCustomConfiguration: async function(
    configLocation: string,
    removeConfigAfter: boolean,
    // eslint-disable-next-line
    modifier: (config: TSCConfig) => void,
    pathToStdOut = ""
  ) : Promise<void>
  {
    const config = InvokeTSC.defaultConfiguration();
    modifier(config);

    configLocation = path.resolve(projectRoot, configLocation);
    await fs.writeFile(
      configLocation,
      JSON.stringify(config, null, 2) + "\n",
      { "encoding": "utf-8" }
    );

    await this.withConfigurationFile(
      configLocation, pathToStdOut
    );

    if (removeConfigAfter) {
      await fs.rm(configLocation);
    }
  },

  // eslint-disable-next-line
  defaultConfiguration: function() : object
  {
    return {
      "compilerOptions": {
        "lib": ["es2022"],
        "module": "es2022",
        "target": "es2022",
        "moduleResolution": "node",
        "sourceMap": true,
        "declaration": true,

        /*
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        */
      },
    }
  }
}

export default InvokeTSC;
