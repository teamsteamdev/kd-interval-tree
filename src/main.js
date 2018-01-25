import curry from 'lodash/fp/curry'

import createSearchTrees from './search'
import createGetGroups from './group'
import createTrees from './trees'

/**
 * Create multiple interval trees. Can be partially applied for multiple sets of items.
 *
 * @param {String[]} keys - Array of alternating "low" and "high" property names
 * @param {Object[]} items - Array of objects with properties listed in keys argument
 * @returns {searchTrees}
 */
const initTrees = curry((keys, items) => {
  const trees = createTrees(keys, items)
  const searchTrees = createSearchTrees(trees)
  const getGroups = createGetGroups(searchTrees)

  return {
    searchTrees,
    getGroups
  }
})

export default initTrees
