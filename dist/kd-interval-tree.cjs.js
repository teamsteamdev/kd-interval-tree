'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _ = _interopDefault(require('lodash/fp'));
var IntervalTree = _interopDefault(require('node-interval-tree'));
var _isError = _interopDefault(require('lodash/isError'));

/**
 * Once the initial params are applied, use in Array.map to populate an interval tree, returning true or an Error if the operation was not successful.
 *
 * @param {IntervalTree} tree - IntervalTree from 'node-interval-tree'
 * @param {string} lowKey - Low interval key name
 * @param {string} highKey - High interval key name
 * @returns {function(item): true|Error} true or an Error if the item was not added to the tree
 */
const addToTree = (tree, lowKey, highKey) => item => {
  const [low, high] = [item[lowKey], item[highKey]].sort();
  const inserted = tree.insert(low, high, item);
  return inserted || new Error(`${item} was not inserted into ${lowKey}, ${highKey} tree.`);
};

const getPairs$1 = _.chunk(2);

/**
 * Apply array of IntervalTrees first. Use in Array.map with an array of low-high value pairs which represent intervals.
 *
 * @param {IntervalTree[]} trees - an array of Interval Trees corresponding to the array of intervals
 * @returns {function(Number[], number): array}
 */
const search = trees => (interval, i) => {
  // console.log('search')
  const [low, high] = interval.sort();
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
const searchTrees = (trees, universe) => (operator, ranges) => {
  // console.log('searchTrees')
  const pairs = getPairs$1(ranges);
  const results = pairs.map(search(trees));

  if (results.length === 1) {
    results.push(universe);
  }

  const operationResult = operator(...results);
  return operationResult;
};

var searchTrees$1 = _.curry(searchTrees);

const logError = x => {
  const isError = _isError(x);
  if (isError) {
    console.error(x);
  }
  return !isError;
};

const getPairs = _.chunk(2);

/**
 * Create multiple interval trees. Can be partially applied for multiple sets of items.
 *
 * @param {String[]} keys - Array of alternating "high" and "low" property names
 * @param {Object[]} items - Array of objects with properties listed in keys argument
 * @returns {searchTrees}
 */
const createTrees = (keys, items) => {
  // console.log('createTrees')
  if (keys.length % 2 !== 0) {
    throw new Error(`Expected keys.length to be an even number. keys.length: ${keys.length}`);
  }

  const pairs = getPairs(keys);
  const trees = pairs.map((pair, i) => {
    const tree = new IntervalTree();
    items.map(addToTree(tree, ...pair)).forEach(logError);
    return tree;
  });

  const partial = searchTrees$1(trees, items);
  partial.count = trees.length;
  partial.trees = trees;

  return partial;
};

var main = _.curry(createTrees);

module.exports = main;
