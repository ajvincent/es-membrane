import type {
  MethodsOnlyInternal
} from "./MethodsOnlyInternal.mjs";

export type WrapThisAndParameters<T extends MethodsOnlyInternal> = {
  [key in keyof T]: (thisObj: T, parameters: Parameters<T[key]>) => void;
}
