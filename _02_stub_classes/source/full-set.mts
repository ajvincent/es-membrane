import path from "path";

import { SourceFile } from "ts-morph";

import { SingletonPromise, PromiseAllParallel } from "#stage_utilities/source/PromiseTypes.mjs";
import ConfigureStub from "./base/baseStub.mjs";
import StubMap from "./exports.mjs";

import type {
  TS_Method,
  TS_Parameter
} from "./base/types/private-types.mjs";
import type {
  ParamRenamer
} from "./transitions/types/paramRenamer.mjs";
import {
  type MiddleParamBuilder as TransitionsEntryMidBuilder,
  type TailParamBuilder as TransitionsEntryTailBuilder,
} from "./transitions/decorators/headCall.mjs";

export type StubClassSetConfiguration = Readonly<{
  sourceFile: SourceFile,
  interfaceOrAliasName: string,
  destinationDir: string,
  className: string,
  pathToTypeFile: string,
  importString: string,
  isDefaultImport: boolean,

  middleParameters: ReadonlyArray<TS_Parameter>;
  tailParamRenamer: ParamRenamer;

  transitionsHead: Readonly<{
    midParamsTypeAlias: string;
    midBuilder: TransitionsEntryMidBuilder,
    tailBuilder: TransitionsEntryTailBuilder,
  }>;

  transitionsMiddle: Readonly<{
    buildMethodBody(this: ConfigureStub, structure: TS_Method, remainingArgs: Set<TS_Parameter>): void;
  }>;
}>

export default class StubClassSet {
  #stubArray: ConfigureStub[] = [];

  constructor(
    config: StubClassSetConfiguration
  )
  {
    this.#build_NI(config);
    this.#build_void(config);
    this.#build_wrapthisinner(config);
    this.#build_spy(config);
    this.#build_prepend_return(config);
    this.#build_prepend_return_ni(config);
    this.#build_transitions_head(config);
    this.#build_transitions_middle(config);
    this.#build_transitions_tail(config);
  }

  #runPromise = new SingletonPromise(() => this.#run());

  async run(): Promise<void> {
    return this.#runPromise.run();
  }

  async #run(): Promise<void> {
    await PromiseAllParallel(this.#stubArray, stub => stub.write());
  }

  #build_NI(
    config: StubClassSetConfiguration
  ): void {
    const generator = new StubMap.NotImplemented;
    generator.setNotImplementedOnly(false);
    this.#stubArray.push(generator);
    this.#initStub(generator, config, "NotImplemented.mts", "_NotImplemented");
  }

  #build_void(
    config: StubClassSetConfiguration,
  ): void {
    const generator = new StubMap.VoidClass;
    this.#stubArray.push(generator);
    this.#initStub(generator, config, "VoidClass.mts", "_Void");
  }

  #build_wrapthisinner(
    config: StubClassSetConfiguration,
  ): void {
    const generator = new StubMap.WrapThisInner;
    this.#stubArray.push(generator);
    this.#initStub(generator, config, "WrapThisInner.mts", "_WrapThisInner");
  }

  #build_spy(
    config: StubClassSetConfiguration,
  ): void {
    const generator = new StubMap.SpyClass;
    this.#stubArray.push(generator);
    this.#initStub(generator, config, "Spy.mts", "_Spy");
  }

  #build_prepend_return(
    config: StubClassSetConfiguration
  ): void {
    const generator = new StubMap.PrependReturn;
    this.#stubArray.push(generator);
    this.#initStub(generator, config, "PrependReturn.mts", "_PrependReturn");
  }

  #build_prepend_return_ni(
    config: StubClassSetConfiguration
  ): void {
    const generator = new StubMap.PrependReturnNI;
    generator.setNotImplementedOnly(false);
    this.#stubArray.push(generator);
    this.#initStub(generator, config, "PrependReturn_NI.mts", "_PrependReturn_NI");
  }

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
  ): void {
    const generator = new StubMap.TransitionsTailStub;
    generator.defineExtraParams(config.middleParameters, config.tailParamRenamer);
    this.#stubArray.push(generator);
    this.#initStub(generator, config, "TransitionsTail.mts", "_Transitions_Tail");
  }

  #initStub(
    generator: ConfigureStub,
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
      config.importString,
      config.isDefaultImport,
    );

    generator.buildClass();
  }
}
