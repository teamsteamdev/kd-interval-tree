import _ from 'lodash/fp'

const getPairs = _.chunk(2)

/**
 * Apply array of IntervalTrees first. Use in Array.map with an array of low-high value pairs which represent intervals.
 *
 * @param {IntervalTree[]} trees - an array of Interval Trees corresponding to the array of intervals
 * @returns {function(Number[], number): array}
 */
const search = trees => (interval, i) => {
  // console.log('search')
  const [low, high] = interval.sort()
  const result = trees[i].search(low, high)
  return result
}

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
  const pairs = getPairs(ranges)
  const results = pairs.map(search(trees))

  if (results.length === 1) {
    results.push(universe)
  }

  const operationResult = operator(...results)
  return operationResult
}

export default _.curry(searchTrees)
