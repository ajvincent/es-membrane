import type {
  Evaluator,
  ManagedRealm,
  PromiseObjectValue,
} from "@engine262/engine262";

export interface GuestRealmInputs {
  readonly startingSpecifier: string;
  readonly contentsGetter: (specifier: string) => string;
  readonly resolveSpecifier: (targetSpecifier: string, sourceSpecifier: string) => string;
}

export interface GuestRealmInputsWithBuiltins extends GuestRealmInputs {
  readonly defineBuiltIns?: (realm: ManagedRealm) => Evaluator<void>;
}

export interface GuestRealmOutputs {
  readonly succeeded: boolean;
  readonly unhandledPromises: PromiseObjectValue[];
}
