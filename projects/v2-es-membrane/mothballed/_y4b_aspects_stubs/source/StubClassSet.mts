// #region preamble
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
// #endregion preamble

/**
 * This class builds a set of stubs from a single base type (and some detailed configuration!).
 */
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
    this.#build_class_invariants_wrapper(config);
  }

  #runPromise = new SingletonPromise(() => this.#run());

  async run(): Promise<void> {
    return this.#runPromise.run();
  }

  async #run(): Promise<void> {
    await PromiseAllParallel(this.#stubArray, stub => stub.write());
  }

  /** "not implemented" */
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

  /**
   * "transitions head"
   * @experimental
   */
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

    generator.wrapClass(config.transitionsTail.classArgumentTypes);

    this.#finalize_stub(generator, config);
  }

  /**
   * "transitions middle, not implemented"
   * @experimental
   */
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

  /**
   * "transitions tail"
   * @experimental
   */
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
    generator.wrapClass(config.transitionsTail.classArgumentTypes);

    this.#finalize_stub(generator, config);
  }

  /** "class invariants" */
  #build_class_invariants_wrapper(
    config: StubClassSetConfiguration
  ): void
  {
    const generator = new StubMap.ClassInvariantsWrapper;
    this.#configure_stub(generator, config, "ClassInvariantsWrapper.mts", "_ClassInvariants");
    generator.wrapClass();
    this.#finalize_stub(generator, config);
  }

  /**
   * Set the basic configuration for a stub generator.  Only the basics, and not writing the file.
   * @param generator - the stub generator
   * @param config - the common configuration.
   * @param targetFileName - where under the destination directory this module is going.
   * @param classSuffix - a module-specific suffix for each class module.
   */
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

  /**
   * Build the class and schedule it for writing.
   * @param generator - the stub generator
   * @param config - the common configuration.
   */
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
