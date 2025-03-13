import type {
  ThrowCompletion
} from "@engine262/engine262";

export * as GuestEngine from '@engine262/engine262';
export {
  type PlainCompletion,
  ThrowCompletion,
} from '@engine262/engine262';

export type ThrowOr<Value> = ThrowCompletion | Value;
