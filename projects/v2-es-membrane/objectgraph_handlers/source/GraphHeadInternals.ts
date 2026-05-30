import ConvertingHeadProxyHandler from "./generated/ConvertingHeadProxyHandler.js";

import type {
  OneToOneStrongMap
} from "../../stage_utilities/source/collections/OneToOneStrongMap.js";

import {
  KeyedRevokerSets
} from "./KeyedRevokerSets.js";

import MembraneInternalError from "./exceptions/MembraneInternalError.js";

export interface GraphHeadInternalsIfc {
  readonly revoked: boolean;
  readonly convertingHeadProxyHandler: ConvertingHeadProxyHandler;
  readonly proxiesOneToOneMap: OneToOneStrongMap<string | symbol, object>;
  readonly shadowTargetToRealTargetMap: WeakMap<object, object>;
  readonly realTargetToOriginGraph: WeakMap<object, string | symbol>;
  readonly keyedRevokerSets: KeyedRevokerSets;
  readonly weakProxySet: WeakSet<object>;
}

export class LiveGraphHeadInternals implements GraphHeadInternalsIfc {
  public readonly revoked: boolean = false;
  public readonly convertingHeadProxyHandler: ConvertingHeadProxyHandler;
  public readonly proxiesOneToOneMap: OneToOneStrongMap<string | symbol, object>;
  public readonly shadowTargetToRealTargetMap = new WeakMap<object, object>;
  public readonly realTargetToOriginGraph = new WeakMap<object, string | symbol>;
  public readonly keyedRevokerSets = new KeyedRevokerSets;
  public readonly weakProxySet = new WeakSet<object>;

  constructor(
    convertingHeadProxyHandler: ConvertingHeadProxyHandler,
    proxiesOneToOneMap: OneToOneStrongMap<string | symbol, object>
  )
  {
    this.convertingHeadProxyHandler = convertingHeadProxyHandler;
    this.proxiesOneToOneMap = proxiesOneToOneMap;
  }
}

export class RevokedGraphHeadInternals implements GraphHeadInternalsIfc {
  static #REVOKED(): never {
    throw new MembraneInternalError("Object graph has been revoked");
  }

  public readonly revoked = true;

  public get convertingHeadProxyHandler(): ConvertingHeadProxyHandler {
    return RevokedGraphHeadInternals.#REVOKED();
  }

  public get proxiesOneToOneMap(): OneToOneStrongMap<string | symbol, object> {
    return RevokedGraphHeadInternals.#REVOKED();
  }

  public get shadowTargetToRealTargetMap(): WeakMap<object, object> {
    return RevokedGraphHeadInternals.#REVOKED();
  }

  public get realTargetToOriginGraph(): WeakMap<object, string | symbol> {
    return RevokedGraphHeadInternals.#REVOKED();
  }

  public get keyedRevokerSets(): KeyedRevokerSets {
    return RevokedGraphHeadInternals.#REVOKED();
  }

  public get weakProxySet(): WeakSet<object> {
    return RevokedGraphHeadInternals.#REVOKED();
  }
}
