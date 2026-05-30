import "es-search-references/guest";
import {
  OneToOneStrongMap
} from "../../source/collections/OneToOneStrongMap.js";

const testMap: OneToOneStrongMap<symbol, object> = new OneToOneStrongMap();

const firstGraphKey = Symbol("first graph");
const secondGraphKey = Symbol("second graph");

class DumbObject {
  readonly id: string;
  constructor(id: string) {
    this.id = id;
  }
}

const firstValue = new DumbObject("first value");
const secondValue = new DumbObject("second value");

testMap.bindOneToOne(firstGraphKey, firstValue, secondGraphKey, secondValue);
searchReferences("1:1 binding to first value from just the map (weak)", firstValue, [testMap], false);
searchReferences("1:1 binding to first value from just the map (strong)", firstValue, [testMap], true);

searchReferences("1:1 binding to first value from the map and second value (strong)", firstValue, [testMap, secondValue], true);

testMap.delete(secondValue, secondGraphKey);

searchReferences("1:1 binding after value was deleted", firstValue, [testMap, secondValue], false);
