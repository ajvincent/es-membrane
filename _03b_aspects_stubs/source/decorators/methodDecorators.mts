// #region preamble
import {
  CodeBlockWriter,
} from "ts-morph";

import getRequiredInitializers from "#stage_utilities/source/RequiredInitializers.mjs";

import {
  markDefined,
  NOT_DEFINED,
  type MaybeDefined,
  assertDefined,
  assertNotDefined,
} from "#stage_utilities/source/maybeDefined.mjs";

import type {
  RightExtendsLeft,
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#mixin_decorators/source/types/StaticAndInstance.mjs";

import {
  ExtendsAndImplements,
} from "../AspectsStubBase.mjs";

import type {
  AspectsStubDecorator,
} from "../types/AspectsStubDecorator.mjs";

import type {
  MethodsOnlyType
} from "../types/MethodsOnlyType.mjs";

import type {
  TS_Method,
  TS_Parameter,
} from "../types/ts-morph-native.mjs";

import type {
  MethodDecoratorsOfClass,
  MethodDecoratorDescription,
} from "../types/MethodDecoratorsOfClass.mjs";

// #endregion preamble

declare const MethodDecoratorsKey: unique symbol;

export type MethodDecoratorsFields<Type extends MethodsOnlyType> = RightExtendsLeft<
  StaticAndInstance<typeof MethodDecoratorsKey>,
  {
    staticFields: object,
    instanceFields: {
      defineMethodDecorators(
        methodDecorators: MethodDecoratorsOfClass<Type>,
        outerClassName: string,
        beforeClassTrap: ((classWriter: CodeBlockWriter) => void),
      ): void;
    }
    symbolKey: typeof MethodDecoratorsKey
  }
>;

const AddMethodDecorators_Decorator: AspectsStubDecorator<MethodDecoratorsFields<MethodsOnlyType>> = function(
  this: void,
  baseClass
)
{
  return class AddMethodDecorators extends baseClass
  {
    static readonly #INIT_ADD_METHODS_KEY = "(add method decorators)";

    #methodDecorators: MaybeDefined<MethodDecoratorsOfClass<MethodsOnlyType>> = NOT_DEFINED;

    constructor(...args: unknown[]) {
      super(...args);
      getRequiredInitializers(this).add(AddMethodDecorators.#INIT_ADD_METHODS_KEY);
    }

    defineMethodDecorators<Type extends MethodsOnlyType>(
      methodDecorators: MethodDecoratorsOfClass<Type>,
      outerClassName = "MethodDecoratedClass",
      beforeClassTrap: ((classWriter: CodeBlockWriter) => void) = (
        classWriter: CodeBlockWriter
      ): void => { void(classWriter) }
    ): void
    {
      getRequiredInitializers(this).mayResolve(AddMethodDecorators.#INIT_ADD_METHODS_KEY);
      assertNotDefined(this.#methodDecorators);
      this.#methodDecorators = markDefined(methodDecorators);

      methodDecorators.importsToAdd.forEach(importToAdd => {
        const {pathToModule, importString, isDefault, isPackageImport} = importToAdd;
        this.addImport(pathToModule, importString, isDefault, isPackageImport);
      });

      this.wrapInFunction(
        [],
        [{
          name: "BaseClass",
          type: `Class<${this.interfaceOrAliasName}>`,
        }],
        outerClassName,
        beforeClassTrap,
      );

      getRequiredInitializers(this).resolve(AddMethodDecorators.#INIT_ADD_METHODS_KEY);
    }

    protected getExtendsAndImplementsTrap(
      context: Map<symbol, unknown>
    ): ExtendsAndImplements
    {
      const results = super.getExtendsAndImplementsTrap(context);
      return {
        ...results,
        extends: "BaseClass",
      }
    }

    protected methodTrap(
      methodStructure: TS_Method | null,
      isBefore: boolean
    ): void
    {
      const decorators = assertDefined(this.#methodDecorators);
      if (isBefore && methodStructure && (methodStructure.name in decorators.methods)) {
        const description = Reflect.get(
          decorators.methods, methodStructure.name
        ) as MethodDecoratorDescription;

        this.classWriter.write("@" + description.decoratorName);
        if (description.parameters)
          this.classWriter.write(`(${this.#parameterNames(description.parameters)})`);
        this.classWriter.newLine();
      }
      return super.methodTrap(methodStructure, isBefore);
    }

    protected buildMethodBodyTrap(
      structure: TS_Method,
      remainingArgs: Set<TS_Parameter>
    ): void
    {
      remainingArgs.clear();

      super.buildMethodBodyTrap(structure, remainingArgs);
      this.classWriter.writeLine(
        `return super.${structure.name}(${this.#parameterNames(structure.parameters)});`
      );
    }

    #parameterNames(parameters: ReadonlyArray<TS_Parameter> | undefined | null): string {
      return parameters?.map(parameter => parameter.name).join(", ") || "";
    }
  }
}

export default AddMethodDecorators_Decorator;
