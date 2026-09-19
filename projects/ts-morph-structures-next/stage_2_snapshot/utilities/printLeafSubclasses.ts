import {
  stdout
} from "node:process";

import {
  type ClassDeclaration,
} from "ts-morph";

import {
  input,
} from "@inquirer/prompts";

import {
  getLeafSubclassesClassesOf,
} from "#utilities/source/ts-morph-d-file.js";

import {
  getStaticAssertMethodsOfNode
} from "./getStaticAssertMethodsOfNode.js";

const branchClassName: string = await input({
  message: "What subclass of Node should be the branch class?"
});

// The leaf nodes are the ones which are unique classes.
const leafNodeClasses: ReadonlyMap<string, ClassDeclaration> = getLeafSubclassesClassesOf(branchClassName);

// Get the list of methods returning type nodes.
/* key: name of static method of Node.  value: class name in TS_MORPH_D */
const staticAssertMethods: ReadonlyMap<string, string> = getStaticAssertMethodsOfNode(leafNodeClasses);

// these are the static methods of Node that convertNode should be calling.
const expectedMethodsOfNode: string[] = Array.from(staticAssertMethods.entries().map(
  ([staticMethodName, className]) => `\`${className}\`: \`${staticMethodName}\``
));
expectedMethodsOfNode.sort();

stdout.write("# " + branchClassName + "\n\n");
for (const method of expectedMethodsOfNode) {
  stdout.write(`- [ ] ${method}\n`);
}
