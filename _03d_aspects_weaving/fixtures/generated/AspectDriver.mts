/* This file is generated.  Do not edit. */
// #region preamble

import NumberStringClass from "../../../_03z_aspects_test_fixtures/fixtures/components/shared/NumberStringClass.mjs";
import {
  type NumberStringType,
} from "../../../_03z_aspects_test_fixtures/fixtures/types/NumberStringType.mjs";
import {
  INDETERMINATE,
} from "#stub_classes/source/symbol-keys.mjs";
import {
  getAspectBuilderForClass,
  buildAspectDictionaryForDriver,
  AspectsDictionary,
} from "#aspects/dictionary/source/generated/AspectsDictionary.mjs";

// #endregion preamble

export default class NumberStringClass_AspectDriver
implements NumberStringType
{
  static readonly #__baseClass__ = NumberStringClass;
  readonly #__target__: NumberStringType;
  readonly #__aspects__: AspectsDictionary<NumberStringType>;

  constructor(...params: ConstructorParameters<typeof NumberStringClass>) {
    this.#__target__ = new NumberStringClass_AspectDriver.#__baseClass__(...params);
    this.#__aspects__ = buildAspectDictionaryForDriver<NumberStringType>(this, this.#__target__);
  }
  //#region aspect stubs

  repeatForward(
    s: string,
    n: number,
  ): string
  {
    for (let i = 0; i < this.#__aspects__.classInvariants.length; i++) {
      const __invariant__ = this.#__aspects__.classInvariants[i];
      __invariant__.repeatForward(s, n);
    }

    const __rv__ = this.#repeatForward(s, n);

    for (let i = 0; i < this.#__aspects__.classInvariants.length; i++) {
      const __invariant__ = this.#__aspects__.classInvariants[i];
      __invariant__.repeatForward(s, n);
    }

    return __rv__;
  }

  #repeatForward(
    s: string,
    n: number,
  ): string
  {

    for (let i = 0; i < this.#__aspects__.bodyComponents.length; i++) {
      const __bodyComponent__ = this.#__aspects__.bodyComponents[i];
      const __rv__ = __bodyComponent__.repeatForward(s, n);
      if (__rv__ !== INDETERMINATE) {
        return __rv__;
      }
    }
    return this.#__target__.repeatForward(s, n);
  }

  repeatBack(
    n: number,
    s: string,
  ): string
  {
    for (let i = 0; i < this.#__aspects__.classInvariants.length; i++) {
      const __invariant__ = this.#__aspects__.classInvariants[i];
      __invariant__.repeatBack(n, s);
    }

    const __rv__ = this.#repeatBack(n, s);

    for (let i = 0; i < this.#__aspects__.classInvariants.length; i++) {
      const __invariant__ = this.#__aspects__.classInvariants[i];
      __invariant__.repeatBack(n, s);
    }

    return __rv__;
  }

  #repeatBack(
    n: number,
    s: string,
  ): string
  {

    for (let i = 0; i < this.#__aspects__.bodyComponents.length; i++) {
      const __bodyComponent__ = this.#__aspects__.bodyComponents[i];
      const __rv__ = __bodyComponent__.repeatBack(n, s);
      if (__rv__ !== INDETERMINATE) {
        return __rv__;
      }
    }
    return this.#__target__.repeatBack(n, s);
  }

  //#endregion aspect stubs

}

getAspectBuilderForClass<NumberStringType>(NumberStringClass_AspectDriver);
