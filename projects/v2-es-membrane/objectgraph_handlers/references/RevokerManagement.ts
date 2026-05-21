import "es-search-references/guest";

import RevokerManagement from "../source/RevokerManagement.js";

const primaryKey = Symbol("primary key");

{
  const manager = new RevokerManagement(primaryKey);
  searchReferences("Revoker management holds primary key strongly", primaryKey, [manager], true);
}

const blueKey = Symbol("blue key")
const redKey = Symbol("red key");

function buildPair(): [object, (this: void) => void] {
  return [{}, () => undefined];
}

/*
{
  const manager = new RevokerManagement(primaryKey);
  const blueOne = Proxy.revocable({}, Reflect),
        blueTwo = Proxy.revocable({}, Reflect),
        redOne = Proxy.revocable({}, Reflect);

  manager.addRevoker(blueOne.proxy, blueOne.revoke, blueKey);
  manager.addRevoker(blueTwo.proxy, blueTwo.revoke, blueKey);
  manager.addRevoker(redOne.proxy, redOne.revoke, redKey);

  searchReferences("Revoker holds proxy strongly", blueOne.proxy, [manager], true);
  searchReferences("Revoker holds proxy weakly", blueOne.proxy, [manager], false);
}
*/
