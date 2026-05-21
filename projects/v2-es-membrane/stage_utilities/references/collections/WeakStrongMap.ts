import "es-search-references/guest";
import WeakStrongMap from "../../source/collections/WeakStrongMap.js";

let testMap: WeakStrongMap<object, unknown, unknown>;

const defaultValue1 = Symbol("default value one");

const externalKey = {}, externalValue = {};
const heldObject = {};

{
  testMap = new WeakStrongMap();
  testMap.set(heldObject, externalKey, externalValue);
  searchReferences("set holds the first key weakly", heldObject, [testMap], false);
  searchReferences("set holds the first key strongly", heldObject, [testMap], true);
}

{
  testMap = new WeakStrongMap();
  testMap.set(externalKey, heldObject, externalValue);
  searchReferences("set holds the second key weakly", heldObject, [testMap], false);
  searchReferences("set holds the second key strongly", heldObject, [testMap], true);
  searchReferences("set holds the second key jointly with the first key", heldObject, [testMap, externalKey], true);
}

{
  testMap = new WeakStrongMap();
  testMap.set(externalKey, defaultValue1, heldObject);
  searchReferences("set holds the value weakly", heldObject, [testMap], false);
  searchReferences("set holds the value strongly", heldObject, [testMap], true);
  searchReferences("set holds the value jointly with the first key", heldObject, [testMap, externalKey], true);
}
