import _ from 'lodash/fp'

import { expandRange, getRange, operateIfAny } from './group.utils.js'

/**
 * Group items using tree keys
 * @param {function} searchTrees
 * @returns {function} - Function that returns groups
 */
const createGetGroups = searchTrees => () => {
  const { items, keys } = searchTrees

  /**
   * Item -> getRange(keys)(Item) -> Item ranges ->
   * expandRange -> Ranges increased by func result ->
   * searchTrees(intersection) -> All Items in expanded range
   * @function getAdjacent
   * @todo write tests for helper functions
   *   - expandRange
   *   - getRange
   * @todo write test for getAdjacent
   */
  const getAdjacent = _.compose(
    searchTrees(_.intersection),
    expandRange(Math.min),
    getRange(keys)
  )

  /**
   * adjacentByItem -> remove duplicate sets -->
   * reduce: if two sets intersect,
   *         return union of sets,
   *         else return first set ->
   * remove duplicate sets -> return groups
   * @function getClusters
   * @param {object[][]} - Array of item sets
   * @todo write tests for helper function
   *   - operateIfAny(operation, comparison op, array, array)
   * @todo write test for getClusters
   */
  const getClusters = _.compose(
    _.uniq,
    operateIfAny(_.intersection, _.union),
    _.uniq
  )

  const adjacentByItem = items.map(getAdjacent)
  const groups = getClusters(adjacentByItem)

  return groups
}

export default createGetGroups
