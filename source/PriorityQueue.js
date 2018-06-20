/**
 * A simple priority queue.
 *
 * @constructor
 * @params levels {Array} of strings and symbols, representing the priorities.
 */
function PriorityQueue(levels)
{
  if (!Array.isArray(levels) || (levels.length == 0))
    throw new Error("levels must be a non-empty array of strings and symbols");
  if (levels.some(function(l) {
    return (typeof l !== "string") && (typeof l !== "symbol");
  }))
    throw new Error("levels must be a non-empty array of strings and symbols");
  const levelSet = new Set(levels);
  if (levelSet.size != levels.length)
    throw new Error("levels must have no duplicates");

  this.levels = Array.from(levels);
  Object.freeze(this.levels);
  this.levelMap = new Map();
  this.levels.forEach((l) => this.levelMap.set(l, []));
  Object.freeze(this.levelMap);
  Object.freeze(this);
}

PriorityQueue.prototype.append = function(level, callback)
{
  if (!this.levels.includes(level))
    throw new Error("Unknown level");
  if (typeof callback !== "function")
    throw new Error("callback must be a function");

  this.levelMap.get(level).push(callback);
};

PriorityQueue.prototype.next = function()
{
  const arrays = Array.from(this.levelMap.values());
  const firstArray = arrays.find((array) => array.length > 0);
  if (!firstArray)
    return false;

  try
  {
    firstArray.shift()();
  }
  catch (e)
  {
    arrays.forEach((array) => array.length = 0);
    throw e;
  }
  return true;
};
