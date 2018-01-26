'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var curry = _interopDefault(require('lodash/fp/curry'));
var IntervalTree = _interopDefault(require('node-interval-tree'));
var _ = _interopDefault(require('lodash/fp'));
var compose = _interopDefault(require('lodash/fp/compose'));
var at = _interopDefault(require('lodash/fp/at'));
var chunk = _interopDefault(require('lodash/fp/chunk'));
var difference = _interopDefault(require('lodash/fp/difference'));
var flatten = _interopDefault(require('lodash/fp/flatten'));
var map = _interopDefault(require('lodash/fp/map'));
var uniqWith = _interopDefault(require('lodash/fp/uniqWith'));

/**
 * Once the initial params are applied, use in Array.map to populate an interval tree, returning true or an Error if the operation was not successful.
 *
 * @param {IntervalTree} tree - IntervalTree from 'node-interval-tree'
 * @param {string} lowKey - Low interval key name
 * @param {string} highKey - High interval key name
 * @returns {function(item): true|Error} true or an Error if the item was not added to the tree
 */
const addToTree = curry((tree, [lowKey, highKey], item) => {
  const values = [item[lowKey], item[highKey]];
  const [low, high] = [Math.min(...values), Math.max(...values)];
  const inserted = tree.insert(low, high, item);

  if (!inserted) {
    throw new Error(`${item} was not inserted into ${lowKey}, ${highKey} tree.`);
  }
});

const createTrees = (rangeKeys, items) => {
  const trees = rangeKeys.map(keys => {
    const tree = new IntervalTree();
    const add = addToTree(tree, keys);

    items.forEach(add);
    tree.keys = keys;
    tree.items = items;
    return tree;
  });

  trees.keys = rangeKeys;
  trees.items = items;

  return trees;
};

/**
 * Apply array of IntervalTrees first. Use in Array.map with an array of low-high value pairs which represent intervals.
 *
 * @param {IntervalTree[]} trees - an array of Interval Trees corresponding to the array of intervals
 * @returns {function(Number[], number): array}
 */
const search = trees => (range, i) => {
  const [low, high] = [Math.min(...range), Math.max(...range)];
  const result = trees[i].search(low, high);
  return result;
};

/**
 * Perform set operations on the search results from multiple interval trees.
 *
 * @function searchTrees
 * @param {IntervalTree[]}   trees   Each IntervalTree should contain the same set of objects mapped with different keys.
 * @param {function(array, array): array}   operator   Any lodash set operator (intersection, without, ect...), or similar function.
 * @param {number[]}    ranges   Pairs of numbers correlating to the trees param. Each pair represents an interval to search within.
 * @returns
 */

const createSearchTrees = trees => {
  const searchTrees = curry((operator, ranges) => {
    const results = ranges.map(search(trees));
    const operationResult = operator(...results);

    return operationResult;
  });

  searchTrees.trees = trees;
  searchTrees.items = trees.items;
  searchTrees.keys = trees.keys;

  return searchTrees;
};

/**
 * Get range array representing object dimensions
 * @param {string[][]} rangeKeys - Array with arrays of key name pairs
 * @param {object} item - Object with properties named in keys array
 * @returns {number[][]} - Array of Number[min, max] representing ranges
 */
const getRanges = curry((rangeKeys, item) => {
  const flatKeys = flatten(rangeKeys);
  const getMinMax = a => [Math.min(...a), Math.max(...a)];

  const getRange = compose(map(getMinMax), chunk(2), at(flatKeys));

  return getRange(item);
});

/**
 * Expand ranges in array by a single amount
 * @param {function} fn - Comparator function to choose amount for expansion
 * @param {number[][]} ranges - Array of Number[min, max] representing ranges
 * @returns {number[][]} - Ranges expanded by value from fn
 */
const expandRanges = curry((fn, ranges) => {
  const diff = ([a, b]) => Math.abs(a - b);
  const amount = fn(...ranges.map(diff));
  const expand = ([min, max]) => [min - amount, max + amount];

  return ranges.map(expand);
});

/**
 * If fn1(a, b) returns an array with length > 0,
 * return result of fn2(a, b), else return a
 *
 * callIfLength will be used in a reducer
 * The reducer will be the first array
 * Each array in the parent array will be
 * compared with the reducer but
 * the reducer will be unified with the array
 * if fn1 :: result.length > 0
 *
 * @param {function} fn1 - Set operation function
 * @param {function} fn2 - Set operation function
 * @param {Array} a
 * @param {Array} b
 * @returns {Array} - Result of operator2(a, b) or a
 */
const callIfLength = curry((fn1, fn2, a, b) => {
  if (fn1(a, b).length > 0) {
    return fn2(a, b);
  } else {
    return a;
  }
});

/**
 * Returns true if arrays have same elements
 * @param {array} x
 * @param {array} y
 */
const hasSameItems = (x, y) => {
  const arrayDiff = difference(x, y);
  const isDifferent = arrayDiff.length > 0;
  return !isDifferent;
};

/**
 * array of arrays, multiple equivalent sets ->
 * remove equivalent array, regardless of order ->
 * array of arrays, one of each set
 * @param {Array[]} sets - An array of arrays
 */
const uniqueSets = sets => {
  return uniqWith(hasSameItems, sets);
};

const trace = label => x => {
  console.log(label, x);
  return x;
};

/**
 * Item -> getRange(keys)(Item) -> Item ranges ->
 * expandRange -> Ranges increased by func result ->
 * searchTrees(intersection) -> All Items in expanded range
 * @function getAdjacent
 * @todo write tests for helper functions
 *   - expandRange
 *   - getRange
 * @todo write test for getAdjacent
 */
const getAdjacent = curry((searchTrees, item) => {
  const { keys } = searchTrees;

  const composed = compose(searchTrees(_.intersection), expandRanges(Math.min), getRanges(keys));

  return composed(item);
});

/**
 * adjacentByItem -> remove duplicate sets -->
 * reduce: if two sets intersect,
 *         return union of sets,
 *         else return first set ->
 * remove duplicate sets -> return groups
 * @function getClusters
 * @param {object[][]} - Array of item sets
 * @todo write tests for helper function
 *   - callIfLength(operation, comparison op, array, array)
 * @todo write test for getClusters
 */
const getClusters = _.compose(
// refactor
uniqueSets, trace('after callIfLength:'), callIfLength(_.intersection, _.union), trace('before callIfLength:'), uniqueSets);

/**
 * Group items using tree keys
 * @param {function} searchTrees
 * @returns {function} - Function that returns groups
 */
const getGroups = searchTrees => {
  const { items } = searchTrees;

  const adjacentByItem = items.map(getAdjacent(searchTrees));
  const groups = getClusters(adjacentByItem);

  return groups;
};

/**
 * Create multiple interval trees. Can be partially applied for multiple sets of items.
 *
 * @param {String[]} keys - Array of ["low", "high"] property name pairs
 * @param {Object[]} items - Array of objects with properties listed in keys argument
 * @returns {searchTrees}
 */
const kdIntervalTree = curry((keys, items) => {
  const trees = createTrees(keys, items);
  const searchTrees = createSearchTrees(trees);
  const groups = getGroups(searchTrees);

  return {
    searchTrees,
    groups
  };
});

module.exports = kdIntervalTree;
