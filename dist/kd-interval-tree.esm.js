import curry from 'lodash/fp/curry';
import IntervalTree from 'node-interval-tree';
import _union from 'lodash/fp/union';
import _intersection from 'lodash/fp/intersection';
import compose from 'lodash/fp/compose';
import at from 'lodash/fp/at';
import chunk from 'lodash/fp/chunk';
import difference from 'lodash/fp/difference';
import flatten from 'lodash/fp/flatten';
import map from 'lodash/fp/map';
import uniqWith from 'lodash/fp/uniqWith';

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();



































var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/**
 * Once the initial params are applied, use in Array.map to populate an interval tree.
 *
 * @param {IntervalTree} tree - IntervalTree from 'node-interval-tree'
 * @param {string} lowKey - Low interval key name
 * @param {string} highKey - High interval key name
 */
var addToTree = curry(function (tree, _ref, item) {
  var _ref2 = slicedToArray(_ref, 2),
      lowKey = _ref2[0],
      highKey = _ref2[1];

  var values = [item[lowKey], item[highKey]];
  var _ref3 = [Math.min.apply(Math, values), Math.max.apply(Math, values)],
      low = _ref3[0],
      high = _ref3[1];

  tree.insert(low, high, item);
});

var createTrees = function createTrees(rangeKeys, items) {
  var trees = rangeKeys.map(function (keys) {
    var tree = new IntervalTree();
    var add = addToTree(tree, keys);

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
var search = function search(trees) {
  return function (range, i) {
    var _ref = [Math.min.apply(Math, toConsumableArray(range)), Math.max.apply(Math, toConsumableArray(range))],
        low = _ref[0],
        high = _ref[1];

    var result = trees[i].search(low, high);
    return result;
  };
};

/**
 * Perform set operations on the search results from multiple interval trees.
 *
 * @function searchTrees
 * @param {IntervalTree[]}   trees   Each IntervalTree should contain the same set of objects mapped with different keys.
 * @param {function(array, array): array}   operator   Any lodash set operator (intersection, without, etc...), or similar function.
 * @param {number[]}    ranges   Pairs of numbers correlating to the trees param. Each pair represents an interval to search within.
 * @returns
 */

var createSearchTrees = function createSearchTrees(trees) {
  var searchTrees = curry(function (operator, ranges) {
    var results = ranges.map(search(trees));
    var operationResult = operator.apply(undefined, toConsumableArray(results));

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
var getRanges = curry(function (rangeKeys, item) {
  var flatKeys = flatten(rangeKeys);
  var getMinMax = function getMinMax(a) {
    return [Math.min.apply(Math, toConsumableArray(a)), Math.max.apply(Math, toConsumableArray(a))];
  };

  var getRange = compose(map(getMinMax), chunk(2), at(flatKeys));

  return getRange(item);
});

/**
 * Expand ranges in array by a single amount
 * @param {function} fn - Comparator function to choose amount for expansion
 * @param {number[][]} ranges - Array of Number[min, max] representing ranges
 * @returns {number[][]} - Ranges expanded by value from fn
 */
var expandRanges = curry(function (fn, ranges) {
  var diff = function diff(_ref) {
    var _ref2 = slicedToArray(_ref, 2),
        a = _ref2[0],
        b = _ref2[1];

    return Math.abs(a - b);
  };
  var amount = fn.apply(undefined, toConsumableArray(ranges.map(diff)));
  var expand = function expand(_ref3) {
    var _ref4 = slicedToArray(_ref3, 2),
        min = _ref4[0],
        max = _ref4[1];

    return [min - amount, max + amount];
  };

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
var callIfLength = curry(function (fn1, fn2, a, b) {
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
var hasSameItems = function hasSameItems(x, y) {
  var arrayDiff = difference(x, y);
  var isDifferent = arrayDiff.length > 0;
  return !isDifferent;
};

/**
 * array of arrays, multiple equivalent sets ->
 * remove equivalent array, regardless of order ->
 * array of arrays, one of each set
 * @param {Array[]} sets - An array of arrays
 */
var uniqueSets = function uniqueSets(sets) {
  return uniqWith(hasSameItems, sets);
};

/**
 * Item -> getRange(keys)(Item) -> Item ranges ->
 * expandRange -> Ranges increased by func result ->
 * searchTrees(intersection) -> All Items in expanded range
 * @function getAdjacent
 */
var getAdjacent = curry(function (searchTrees, item) {
  var keys = searchTrees.keys;


  var composed = compose(searchTrees(_intersection), expandRanges(Math.min), getRanges(keys));

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
var getClusters = function getClusters(sets) {
  var uniteIfIntersect = callIfLength(_intersection, _union);

  var uniqueAdjacents = uniqueSets(sets);
  var clusters = uniqueAdjacents.map(function (set) {
    return sets.reduce(uniteIfIntersect, set);
  });
  var uniqueGroups = uniqueSets(clusters);

  return uniqueGroups;
};

/**
 * Group items using tree keys
 * @param {function} searchTrees
 * @returns {function} - Function that returns groups
 */
var getGroups = function getGroups(searchTrees) {
  var items = searchTrees.items;


  var adjacentByItem = items.map(getAdjacent(searchTrees));
  var groups = getClusters(adjacentByItem);

  return groups;
};

/**
 * Create multiple interval trees. Can be partially applied for multiple sets of items.
 *
 * @param {String[]} keys - Array of ["low", "high"] property name pairs
 * @param {Object[]} items - Array of objects with properties listed in keys argument
 * @returns {searchTrees}
 */
var kdIntervalTree = curry(function (keys, items) {
  var trees = createTrees(keys, items);
  var searchTrees = createSearchTrees(trees);

  return searchTrees;
});

export { kdIntervalTree, getGroups as getGroupsFromKD };
