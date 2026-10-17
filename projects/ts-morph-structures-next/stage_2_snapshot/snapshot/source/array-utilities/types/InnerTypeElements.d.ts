import { GET_OUTER_TYPE } from "../symbols.ts";

export interface InnerTypeElement<OuterType> {
  [GET_OUTER_TYPE](): OuterType;
}
