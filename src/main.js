import _ from 'lodash/fp'
import IntervalTree from 'node-interval-tree'

import addToTree from './addToTree'
import searchTrees from './search'
import logError from './errors'

const getPairs = _.chunk(2)

/**
 * Create multiple interval trees. Can be partially applied for multiple sets of items.
 *
 * @param {String[]} keys - Array of alternating "low" and "high" property names
 * @param {Object[]} items - Array of objects with properties listed in keys argument
 * @returns {searchTrees}
 */
const createTrees = (keys, items) => {
  // console.log('createTrees')
  if (keys.length % 2 !== 0) {
    throw new Error(
      `Expected keys.length to be an even number. keys.length: ${keys.length}`
    )
  }

  const pairs = getPairs(keys)
  const trees = pairs.map((pair, i) => {
    const tree = new IntervalTree()
    items.map(addToTree(tree, ...pair)).forEach(logError)
    return tree
  })

  const partial = searchTrees(trees, items)
  partial.count = trees.length
  partial.trees = trees

  return partial
}

export default _.curry(createTrees)
