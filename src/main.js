import curry from 'lodash/fp/curry'

import createTrees from './trees'
import createSearchTrees from './search'
import { getGroups } from './group'

/**
 * Create multiple interval trees. Can be partially applied for multiple sets of items.
 *
 * @param {String[]} keys - Array of ["low", "high"] property name pairs
 * @param {Object[]} items - Array of objects with properties listed in keys argument
 * @returns {searchTrees}
 */
const kdIntervalTree = curry((keys, items) => {
  const trees = createTrees(keys, items)
  const searchTrees = createSearchTrees(trees)
  const groups = getGroups(searchTrees)

  return {
    searchTrees,
    groups
  }
})

export default kdIntervalTree
