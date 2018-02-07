import _ from 'lodash/fp'
import compose from 'lodash/fp/compose'
import curry from 'lodash/fp/curry'

import {
  expandRanges,
  getRanges,
  callIfLength,
  uniqueSets,
} from './group.utils'

/**
 * Item -> getRange(keys)(Item) -> Item ranges ->
 * expandRange -> Ranges increased by func result ->
 * searchTrees(intersection) -> All Items in expanded range
 * @function getAdjacent
 */
export const getAdjacent = curry((searchTrees, item) => {
  const { keys } = searchTrees

  const composed = compose(
    searchTrees(_.intersection),
    expandRanges(Math.min),
    getRanges(keys),
  )

  return composed(item)
})

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
export const getClusters = sets => {
  const uniteIfIntersect = callIfLength(_.intersection, _.union)

  const uniqueAdjacents = uniqueSets(sets)
  const clusters = uniqueAdjacents.map(set =>
    sets.reduce(uniteIfIntersect, set),
  )
  const uniqueGroups = uniqueSets(clusters)

  return uniqueGroups
}

/**
 * Group items using tree keys
 * @param {function} searchTrees
 * @returns {function} - Function that returns groups
 */
export const getGroups = searchTrees => {
  const { items } = searchTrees

  const adjacentByItem = items.map(getAdjacent(searchTrees))
  const groups = getClusters(adjacentByItem)

  return groups
}
