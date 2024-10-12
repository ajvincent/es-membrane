// #region preamble
import path from "path";

import {
  pathToModule
} from "#stage_utilities/source/AsyncSpecModules.mjs";

import StubMap from "#aspects/stubs/source/StubMap.mjs";

import {
  sourceFile,
  generatedDir,
  pathToTypeFile,
} from "./constants.mjs";


import type {
  MethodDecoratorsOfClass,
} from "#aspects/stubs/source/types/MethodDecoratorsOfClass.mjs";

import {
  createSpyDecoratorForward,
  createSpyDecoratorBack
} from "../fixtures/components/methodDecorators/spy.mjs";

import type {
  NumberStringType
} from "#stage_utilities/fixtures/types/NumberStringType.mjs";

import { CodeBlockWriter } from "ts-morph";
import { TS_Method } from "#aspects/stubs/source/types/ts-morph-native.mjs";

// #endregion preamble

const SpyContext = {
  forward: createSpyDecoratorForward(),
  back: createSpyDecoratorBack(),
};
export { SpyContext };

export default
async function buildMethodDecoratedStub() : Promise<void>
{
  const destinationDir = path.join(generatedDir, "stubs");
  class builderClass extends StubMap.AddMethodDecorators {
    protected methodDeclarationTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean
    ): void
    {
      if (isBefore && !methodStructure) {
        this.classWriter.writeLine(`static readonly forwardEvents = spyForward.events;`);
        this.classWriter.writeLine(`static readonly backEvents = spyBack.events;`);
        this.classWriter.newLine();
      }

      return super.methodDeclarationTrap(methodStructure, isBefore);
    }
  }
  const builder = new builderClass;

  const pathToSpyModule = pathToModule({
    importMeta: import.meta,
    pathToDirectory: "../../fixtures/components/methodDecorators",
  }, "spy.mjs");

  const decoratorList: MethodDecoratorsOfClass<NumberStringType> = {
    importsToAdd: [
      {
        pathToModule: pathToSpyModule,
        importString: "createSpyDecoratorForward",
        isDefault: false,
        isPackageImport: false
      },
      {
        pathToModule: pathToSpyModule,
        importString: "createSpyDecoratorBack",
        isDefault: false,
        isPackageImport: false
      },
    ],
    methods: {
      repeatForward: [{
        decoratorName: "spyForward.spyDecorator",
        typeParameters: null,
        parameters: null,
      }],

      repeatBack: [{
        decoratorName: "spyBack.spyDecorator",
        typeParameters: null,
        parameters: null,
      }],
    },
  };

  builder.configureStub(
    sourceFile,
    "NumberStringType",
    path.join(destinationDir, "SpyMethodDecorated.mts"),
    "NST_SpyMethodDecorated"
  );

  builder.addImport(
    pathToTypeFile,
    "type NumberStringType",
    false,
    true
  );

  builder.defineMethodDecorators(
    decoratorList,
    "MethodDecoratedClass",
    (classWriter: CodeBlockWriter) => {
      classWriter.writeLine(`const spyForward = createSpyDecoratorForward();`);
      classWriter.writeLine(`const spyBack = createSpyDecoratorBack();`);
    }
  );

  builder.buildClass();
  await builder.write();
}
