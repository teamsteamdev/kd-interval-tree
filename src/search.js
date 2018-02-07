import curry from 'lodash/fp/curry'

/**
 * Apply array of IntervalTrees first. Use in Array.map with an array of low-high value pairs which represent intervals.
 *
 * @param {IntervalTree[]} trees - an array of Interval Trees corresponding to the array of intervals
 * @returns {function(Number[], number): array}
 */
const search = trees => (range, i) => {
  const [low, high] = [Math.min(...range), Math.max(...range)]
  const result = trees[i].search(low, high)
  return result
}

/**
 * Perform set operations on the search results from multiple interval trees.
 *
 * @function searchTrees
 * @param {IntervalTree[]}   trees   Each IntervalTree should contain the same set of objects mapped with different keys.
 * @param {function(array, array): array}   operator   Any lodash set operator (intersection, without, etc...), or similar function.
 * @param {number[]}    ranges   Pairs of numbers correlating to the trees param. Each pair represents an interval to search within.
 * @returns
 */

const createSearchTrees = trees => {
  const searchTrees = curry((operator, ranges) => {
    const results = ranges.map(search(trees))
    const operationResult = operator(...results)

    return operationResult
  })

  searchTrees.trees = trees
  searchTrees.items = trees.items
  searchTrees.keys = trees.keys

  return searchTrees
}

export default createSearchTrees
