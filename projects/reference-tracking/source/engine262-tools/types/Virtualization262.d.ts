import type {
  ManagedRealm
} from "@engine262/engine262";

export interface GuestRealmInputs {
  readonly absolutePathToFile: string;
  defineBuiltIns?: (realm: ManagedRealm) => void;
}
