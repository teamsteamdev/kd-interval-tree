import IntervalTree from 'node-interval-tree'

import getPairs from './getPairs'
import addToTree from './addToTree'
import searchTrees from './search'
import logError from './errors'

/**
 * Create multiple interval trees. Can be partially applied for multiple sets of items.
 *
 * @param {String[]} keys - Array of alternating "low" and "high" property names
 * @param {Object[]} items - Array of objects with properties listed in keys argument
 * @returns {searchTrees}
 */
const createTrees = (keys, items) => {
  const curried = keys => items => {
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

  return items ? curried(keys)(items) : curried(keys)
}

export default createTrees
