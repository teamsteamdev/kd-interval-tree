import IntervalTree from 'node-interval-tree';
import _ from 'lodash/fp';

var getPairs = (array => array.reduce((reducer, element, index, array) => {
  const isEven = index % 2 === 0;

  if (isEven) {
    const next = array[index + 1];
    const pair = next ? [element, next] : [element];
    return [...reducer, pair];
  }

  return reducer;
}, []));

/**
 * Once the initial params are applied, use in Array.map to populate an interval tree, returning true or an Error if the operation was not successful.
 *
 * @param {IntervalTree} tree - IntervalTree from 'node-interval-tree'
 * @param {string} lowKey - Low interval key name
 * @param {string} highKey - High interval key name
 * @returns {function(item): true|Error} true or an Error if the item was not added to the tree
 */
const addToTree = (tree, lowKey, highKey) => item => {
  const [low, high] = [item[lowKey], item[highKey]].sort((a, b) => a - b);
  const inserted = tree.insert(low, high, item);
  return inserted || new Error(`${item} was not inserted into ${lowKey}, ${highKey} tree.`);
};

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

const searchTrees = trees => (operator, ranges) => {
  const curry = operator => ranges => {
    const pairs = getPairs(ranges);
    const results = pairs.map(search(trees));

    const operationResult = operator(...results);
    return operationResult;
  };

  return ranges ? curry(operator)(ranges) : curry(operator);
};

/**
 * Get padding amount
 * @param {string[]} keys - Property names used to calculate padding
 * @param {Object} item - Item
 * @returns {number}
 */
const getPadByKeys = keys => item => Math.min(...keys.map(k => item[k]));

/**
 * Widen search range: setPad => padRange => paddedRange
 * @param {number} pad - Amount to widen range
 * @param {number[]} range - Minimum and maximun range values
 * @returns {number[]}
 */
const setPad = pad => ([min, max]) => [Math.max(min - pad, 0), max + pad];

/**
 * Get range array from Item object
 * @param {string[]} keys - Property names containing range values
 * @param {Object} item - Item
 * @returns {number[]} - Range: [min, max]
 */
const setRangeByKeys = keys => item => keys.map(key => item[key]).sort((a, b) => a - b);

/**
 *
 * @param {string[]} paddingKeys - Property names used to calculate padding
 * @param {IntervalTree} tree - Interval Tree to search
 * @returns {Array[]} - Contains arrays of overlapping items
 */
const toGroups = paddingKeys => tree => {
  const { items, keys } = tree;
  console.log('keys', keys);

  const getRange = setRangeByKeys(keys);
  const getPad = getPadByKeys(paddingKeys);

  const padRanges = items.map(getPad).map(setPad);
  const itemRanges = items.map(getRange);

  const paddedRanges = itemRanges.map((r, i) => padRanges[i](r));

  // Find adjacent items
  const results = paddedRanges.map(range => tree.search(...range).map(i => i.id).sort());

  return results;
};

/**
 * Group items recursively
 * @param {IntervalTree[]} trees - Array of IntervalTrees
 * @param {Number|Function} fn - Number or Function that returns a number
 * @returns {Function} - A function that takes one function as a param.
 *    This function returns a value to use to expand the search range.
 */
const groupFromTrees = seedTrees => paddingKeys => {
  // Clone or create consumable trees from seedTrees
  const trees = _.cloneDeep(seedTrees);

  // Get clusters from each tree
  const resultsByTree = trees.map(toGroups(paddingKeys));
  // Get intersection of each tree result
  const resultsByItem = _.zip(...resultsByTree);
  console.log('resultsByItem', resultsByItem);
  const intersections = resultsByItem.map(([x, y]) => _.intersection(x, y));
  console.log('intersections', intersections);

  const groups = intersections.map(group => {
    const intersects = _.intersection(group);
    const groupSet = intersections.reduce((set, g) => {
      if (intersects(g)) {
        set.add(...g);
      }

      return set;
    }, new Set(group));

    return [...groupSet].sort();
  });

  console.log('groups', groups);
  return groups;
};

/**
 * Create multiple interval trees. Can be partially applied for multiple sets of items.
 *
 * @param {String[]} keys - Array of alternating "low" and "high" property names
 * @param {Object[]} items - Array of objects with properties listed in keys argument
 * @returns {searchTrees}
 */
const createTrees = (keys, items) => {
  const curried = keys => items => {
    const pairs = getPairs(keys);
    const trees = pairs.map((pair, i) => {
      const tree = new IntervalTree();
      items.map(addToTree(tree, ...pair));
      tree.keys = pair;
      tree.items = items;
      return tree;
    });

    const partial = searchTrees(trees);

    partial.count = trees.length;
    partial.trees = trees;

    partial.getGroups = groupFromTrees(trees);

    return partial;
  };

  return items ? curried(keys)(items) : curried(keys);
};

export default createTrees;
