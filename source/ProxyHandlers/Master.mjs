import {
  LinkedList,
  LinkedListNode
} from "./LinkedList.mjs";

import ConvertFromShadow from "./ConvertFromShadow.mjs";
import UpdateShadow from "./UpdateShadow.mjs";

import {
  allTraps,
} from "../core/sharedUtilities.mjs";

class MiddleList extends LinkedListNode {
  constructor(master, name) {
    super(master.objectGraph, name);
    this.subList = new LinkedList(master.objectGraph, master.getNextNode("head"));
  }
}

allTraps.forEach((trapName) => {
  MiddleList.prototype[trapName] = function(...args) {
    return this.subList[trapName](...args);
  };
});
Object.freeze(MiddleList.prototype);
Object.freeze(MiddleList);

/**
 * The master ProxyHandler for an object graph.
 *
 * @param objectGraph {ObjectGraph} The object graph from a Membrane.
 */
export default class Master extends LinkedList {
  constructor(objectGraph) {
    super(objectGraph, Reflect);

    // These are the four linked list nodes at the master level.
    [
      "inbound",
      "distortions",
      "wrapping",
      "outbound",
    ].forEach(function(name) {
      let node = new MiddleList(this, name, this);
      this.insertNode("head", node);
      Object.freeze(node);
    }, this);
  
    { //  outbound
      const subList = this.getNodeByName("outbound").subList;
      {
        const updateShadow = new UpdateShadow(this.objectGraph, "updateShadow");
        subList.insertNode("head", updateShadow);
      }
    }
  
    { // inbound
      const subList = this.getNodeByName("inbound").subList;
      {
        const convertFromShadow = new ConvertFromShadow(this.objectGraph, "convertFromShadow");
        subList.insertNode("head", convertFromShadow);
      }
    }
  
    this.lock();
    Object.freeze(this);
  }
}
