import path from "path";

import {
  SingletonPromise,
  PromiseAllParallel
} from "#stage_utilities/source/PromiseTypes.mjs";

import type {
  StubClassSetConfiguration
} from "./types/StubClassSetConfiguration.mjs";

import AspectsStubBase from "./AspectsStubBase.mjs";

import StubMap from "./StubMap.mjs";

export default class StubClassSet
{
  #stubArray: AspectsStubBase[] = [];

  constructor(
    config: StubClassSetConfiguration
  )
  {
    this.#build_NI_Base(config);
    /*
    this.#build_transitions_head(config);
    this.#build_transitions_middle(config);
    */
    this.#build_transitions_tail(config);
  }

  #runPromise = new SingletonPromise(() => this.#run());

  async run(): Promise<void> {
    return this.#runPromise.run();
  }

  async #run(): Promise<void> {
    await PromiseAllParallel(this.#stubArray, stub => stub.write());
  }

  #build_NI_Base(
    config: StubClassSetConfiguration
  ): void {
    const generator = new StubMap.NotImplementedBase;
    this.#stubArray.push(generator);

    generator.configureStub(
      config.sourceFile,
      config.interfaceOrAliasName,
      path.resolve(config.destinationDir, "NotImplemented_Base.mts"),
      config.className + "_NotImplemented_Base"
    );

    generator.addImport(
      config.pathToTypeFile,
      "type " + config.interfaceOrAliasName,
      false,
      config.isTypeFilePackage,
    );

    generator.buildClass();
  }

  /*
  #build_transitions_head(
    config: StubClassSetConfiguration
  ): void {
    const generator = new StubMap.TransitionsHeadStub;
    generator.defineExtraParams(
      config.middleParameters,
      config.transitionsHead.midParamsTypeAlias,
      config.transitionsHead.midBuilder,
      config.tailParamRenamer,
      config.transitionsHead.tailBuilder
    );
    this.#stubArray.push(generator);
    this.#initStub(generator, config, "TransitionsHead.mts", "_Transitions_Head");
  }

  #build_transitions_middle(
    config: StubClassSetConfiguration
  ): void {
    const generator = new StubMap.TransitionsStub;
    generator.defineExtraParams(config.middleParameters, config.tailParamRenamer);
    generator.defineBuildMethodBody(config.transitionsMiddle.buildMethodBody);
    this.#stubArray.push(generator);
    this.#initStub(generator, config, "TransitionsMiddle.mts", "_Transitions_Middle");
  }

  */

  #build_transitions_tail(
    config: StubClassSetConfiguration
  ): void {
    const generator = new StubMap.TransitionsTail;
    generator.defineExtraParams(config.middleParameters, config.transitionsTail.paramRenamer);
    this.#stubArray.push(generator);
    generator.configureStub(
      config.sourceFile,
      config.interfaceOrAliasName,
      path.resolve(config.destinationDir, "TransitionsTail.mts"),
      config.className + "_Transitions_Tail"
    );
    generator.wrapInClass(config.transitionsTail.classArgumentTypes);
    generator.addImport(
      config.pathToTypeFile,
      "type " + config.interfaceOrAliasName,
      false,
      config.isTypeFilePackage,
    );

    generator.buildClass();
  }
}
