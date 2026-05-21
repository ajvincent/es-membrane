import "es-search-references/guest";
import { WeakRefSet } from "../../source/collections/WeakRefSet.js";

const refSet: WeakRefSet<object> = new WeakRefSet();

const firstValue = {};
refSet.addReference(firstValue);

//FIXME: debugger statement causes an engine262 assertion failure
searchReferences("refset with first value just inserted (weak)", firstValue, [refSet], false);
searchReferences("refset with first value just inserted (strong)", firstValue, [refSet], true);
