import type {
  GuestEngine
} from "./GuestEngine.js";

export interface GuestRealmInputs {
  readonly absolutePathToFile: string;
  defineBuiltIns?: (realm: GuestEngine.ManagedRealm) => GuestEngine.Evaluator<void>;
}

export interface GuestRealmOutputs {
  succeeded: boolean;
  readonly unhandledPromises: GuestEngine.PromiseObjectValue[];
}
