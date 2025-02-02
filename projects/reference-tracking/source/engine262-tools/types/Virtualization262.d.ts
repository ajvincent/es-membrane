import * as GuestEngine from "@engine262/engine262";

export interface GuestRealmInputs {
  readonly absolutePathToFile: string;
  defineBuiltIns?: (realm: GuestEngine.ManagedRealm) => void;
}

export interface GuestRealmOutputs {
  succeeded: boolean;
  readonly unhandledPromises: GuestEngine.PromiseObjectValue[];
}
