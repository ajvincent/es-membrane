//FIXME: remove this file altogether.  I wrote it when engine262 generated warnings on every import, and only to reduce noise.
import type {
  ThrowCompletion
} from "@magic-works/engine262";

export * as GuestEngine from '@magic-works/engine262';
export {
  type PlainCompletion,
  ThrowCompletion,
} from '@magic-works/engine262';

export type ThrowOr<Value> = ThrowCompletion | Value;
