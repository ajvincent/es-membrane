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
    this.#build_transitions_head(config);
    this.#build_transitions_not_implemented(config);
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

    this.#configure_stub(
      generator,
      config,
      "NotImplemented_Base.mts",
      "_NotImplemented_Base",
    );

    this.#finalize_stub(generator, config);
  }

  #build_transitions_head(
    config: StubClassSetConfiguration
  ): void {
    const generator = new StubMap.TransitionsHead;
    this.#configure_stub(generator, config, "TransitionsHead.mts", "_Transitions_Head");

    generator.defineExtraParams(
      true,
      config.middleParameters,
      config.transitionsHead.midParamsTypeAlias,
      config.transitionsHead.midBuilder,
      config.transitionsTail.paramRenamer,
      config.transitionsHead.tailBuilder
    );

    generator.wrapInClass(config.transitionsTail.classArgumentTypes);

    this.#finalize_stub(generator, config);
  }

  #build_transitions_not_implemented(
    config: StubClassSetConfiguration
  ): void {
    const generator = new StubMap.Transitions_NotImplemented;

    this.#configure_stub(
      generator,
      config,
      "Transitions_NotImplemented.mts",
      "_Transitions_NI",
    );

    generator.defineExtraParams(
      true,
      config.middleParameters,
      config.transitionsTail.paramRenamer
    );

    this.#finalize_stub(generator, config);
  }

  #build_transitions_tail(
    config: StubClassSetConfiguration
  ): void {
    const generator = new StubMap.TransitionsTail;
    generator.defineExtraParams(
      true,
      config.middleParameters,
      config.transitionsTail.paramRenamer
    );

    this.#configure_stub(
      generator,
      config,
      "TransitionsTail.mts",
      "_Transitions_Tail",
    );
    generator.wrapInClass(config.transitionsTail.classArgumentTypes);

    this.#finalize_stub(generator, config);
  }

  #configure_stub(
    generator: AspectsStubBase,
    config: StubClassSetConfiguration,
    targetFileName: string,
    classSuffix: string,
  ): void {
    generator.configureStub(
      config.sourceFile,
      config.interfaceOrAliasName,
      path.resolve(config.destinationDir, targetFileName),
      config.className + classSuffix
    );
  }

  #finalize_stub(
    generator: AspectsStubBase,
    config: StubClassSetConfiguration
  ): void {
    this.#stubArray.push(generator);

    generator.addImport(
      config.pathToTypeFile,
      "type " + config.interfaceOrAliasName,
      false,
      config.isTypeFilePackage,
    );

    generator.buildClass();
  }
}
