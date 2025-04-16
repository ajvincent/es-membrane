import {
  GuestEngine
} from "./GuestEngine.js";

import {
  runInRealm,
} from "./runInRealm.js";

import {
  GuestRealmInputs,
  GuestRealmOutputs
} from '../types/Virtualization262.js';

export async function directInvoke(
  realmInputs: GuestRealmInputs,
): Promise<GuestRealmOutputs>
{
  return await runInRealm({
    absolutePathToFile: realmInputs.absolutePathToFile,
    defineBuiltIns: function * (realm: GuestEngine.ManagedRealm): GuestEngine.Evaluator<void> {
      if (realmInputs.defineBuiltIns)
        yield * realmInputs.defineBuiltIns(realm);
    }
  });
}

