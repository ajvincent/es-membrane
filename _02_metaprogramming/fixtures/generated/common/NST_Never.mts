/* This file is generated.  Do not edit. */
// #region preamble

import {
  type NumberStringType,
} from "../../types/NumberStringType.mjs";
import {
  type NotImplementedOnly,
} from "../../../source/aspects/public-types/NotImplementedOnly.mjs";

// #endregion preamble

export default class NumberStringClass_Never
implements NotImplementedOnly<NumberStringType>
{
  repeatForward(
    s: string,
    n: number,
  ): never
  {
    void(s);
    void(n);
    throw new Error("not yet implemented");
  }

  repeatBack(
    n: number,
    s: string,
  ): never
  {
    void(n);
    void(s);
    throw new Error("not yet implemented");
  }
}
