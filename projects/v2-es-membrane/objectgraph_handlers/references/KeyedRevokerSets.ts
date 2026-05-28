import "es-search-references/guest";

import { KeyedRevokerSets } from "../source/KeyedRevokerSets.js";

const keyedSet = new KeyedRevokerSets;

const primaryKey = Symbol("primary key");
const blueKey = Symbol("blue key");

const blueOne = Proxy.revocable({}, Reflect);
keyedSet.addRevoker(blueOne.proxy, blueOne.revoke, [primaryKey, blueKey]);

searchReferences("weak hold on proxy", blueOne.proxy, [keyedSet], false);
searchReferences("strong hold on proxy", blueOne.proxy, [keyedSet], true);

// we know revokers hold strong references to proxies in their internal slots

searchReferences("weak hold on revoker", blueOne.revoke, [keyedSet], false);
searchReferences("strong hold on revoker", blueOne.revoke, [keyedSet], true);
searchReferences("joint hold on revoker with proxy", blueOne.revoke, [keyedSet, blueOne.proxy], true);

// we don't really care about the keys being held strongly, at least not now
