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
    this.#build_transitions_tail(config);
    */
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
    this.#initStub(generator, config, "NotImplemented_Base.mts", "_NotImplemented_Base");
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

  #build_transitions_tail(
    config: StubClassSetConfiguration
    generator.defineExtraParams(config.middleParameters, config.tailParamRenamer);
  ): void {
    const generator = new StubMap.TransitionsTailStub;
    this.#stubArray.push(generator);
    this.#initStub(generator, config, "TransitionsTail.mts", "_Transitions_Tail");
  }
  */

  #initStub(
    generator: AspectsStubBase,
    config: StubClassSetConfiguration,
    classFileName: string,
    classSpecificName: string,
  ): void {
    generator.configureStub(
      config.sourceFile,
      config.interfaceOrAliasName,
      path.resolve(config.destinationDir, classFileName),
      config.className + classSpecificName
    );

    generator.addImport(
      config.pathToTypeFile,
      "type " + config.interfaceOrAliasName,
      false,
    );

    generator.buildClass();
  }
}
