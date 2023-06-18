// #region preamble
import CodeBlockWriter from "code-block-writer";

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#stage_utilities/source/types/StaticAndInstance.mjs";

import getRequiredInitializers from "#stage_utilities/source/RequiredInitializers.mjs";

import MultiMixinBuilder from "#stage_utilities/source/MultiMixinBuilder.mjs";

import getTS_SourceFile from "#stage_utilities/source/getTS_SourceFile.mjs";

import ConfigureStub, {
  type ExtendsAndImplements
} from "#stub_classes/source/base/ConfigureStub.mjs";

import type {
  TS_Method,
  TS_Parameter,
  TS_TypeParameter,
} from "#stub_classes/source/types/export-types.mjs";

import type {
  ConfigureStubDecorator
} from "#stub_classes/source/base/types/ConfigureStubDecorator.mjs";
import {
  ModuleSourceDirectory,
  pathToModule,
} from "#stage_utilities/source/AsyncSpecModules.mjs";

// #endregion preamble

// #region stub setup

declare const HelloWorldKey: unique symbol;

type HelloWorldFields = RightExtendsLeft<StaticAndInstance<typeof HelloWorldKey>, {
  staticFields: object,
  instanceFields: object,
  symbolKey: typeof HelloWorldKey,
}>;

const HelloWorldDecorator: ConfigureStubDecorator<HelloWorldFields, false> = function(
  this: void,
  baseClass
)
{
  return class HelloWorld extends baseClass {
    static readonly #INIT_KEY = "(wrap function key)";

    constructor(...args: unknown[]) {
      super(...args);
      getRequiredInitializers(this).add(HelloWorld.#INIT_KEY);
    }

    protected getExtendsAndImplementsTrap(context: Map<symbol, unknown>): ExtendsAndImplements {
      const result = super.getExtendsAndImplementsTrap(context);

      return {
        ...result,
        extends: "NST_Class",
      }
    }

    wrapInFunction(
      typeParameters: ReadonlyArray<TS_TypeParameter>,
      parameters: ReadonlyArray<TS_Parameter>,
      functionName: string,
      beforeClassTrap: (classWriter: CodeBlockWriter) => void,
    ) : void
    {
      getRequiredInitializers(this).resolve(HelloWorld.#INIT_KEY);
      super.wrapInFunction(typeParameters, parameters, functionName, beforeClassTrap);
    }

    protected insertAdditionalMethodsTrap(
      existingMethods: ReadonlyArray<TS_Method>
    ): ReadonlyArray<TS_Method>
    {
      return [
        {
          name: "#sayHi",
          parameters: [
            {name: "methodName", type: "string"},
          ],
          returnType: "void",
        },
        ...existingMethods,
      ];
    }

    protected methodTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean,
    ) : void
    {
      super.methodTrap(methodStructure, isBefore);
      if (isBefore && !methodStructure) {
        this.classWriter.writeLine(
          `readonly _calls: string[] = [];`
        );
      }
    }

    protected buildMethodBodyTrap(
      structure: TS_Method,
      remainingArgs: Set<TS_Parameter>,
    ): void
    {
      if (structure.name !== "#sayHi") {
        const paramsStr = structure.parameters?.map(
          param  => param.name
        ).join(", ") ?? "";

        this.classWriter.writeLine(
          `this.#sayHi(\`${structure.name}\`);`
        );

        this.classWriter.writeLine(
          `return super.${structure.name}(${paramsStr});`
        );
        remainingArgs.clear();

        super.buildMethodBodyTrap(structure, remainingArgs);
        return;
      }

      this.classWriter.writeLine(`this._calls.push(methodName);`);
      remainingArgs.clear();
      super.buildMethodBodyTrap(structure, remainingArgs);
    }
  }
}

const HelloWorldStub = MultiMixinBuilder<[HelloWorldFields], typeof ConfigureStub>(
  [HelloWorldDecorator], ConfigureStub
);

// #endregion stub setup

// #region invoke the mixin
const HelloWorldGenerator = new HelloWorldStub;

const stageDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../.."
};

const sourceFile = getTS_SourceFile(stageDir, "fixtures/types/NumberStringType.d.mts");

export default async function buildHelloWorld(): Promise<void> {
  HelloWorldGenerator.configureStub(
    sourceFile,
    "NumberStringType",
    pathToModule(stageDir, "spec-generated/HelloWorld.mts"),
    "NST_HelloWorld",
  );

  HelloWorldGenerator.wrapInFunction(
    [], [{
      name: "NST_Class",
      type: "typeof NumberStringClass"
    }], "wrap_NST", (classWriter) => void(classWriter)
  );

  HelloWorldGenerator.addImport(
    pathToModule(stageDir, "fixtures/types/NumberStringType.mjs"),
    "type NumberStringType",
    false,
  );

  HelloWorldGenerator.addImport(
    pathToModule(stageDir, "fixtures/components/shared/NumberStringClass.mjs"),
    "NumberStringClass",
    true
  );

  HelloWorldGenerator.buildClass();
  await HelloWorldGenerator.write();
}

// #endregion invoke the mixin
