import _ from 'lodash/fp'

/**
 * Get padding amount
 * @param {string[]} keys - Property names used to calculate padding
 * @param {Object} item - Item
 * @returns {number}
 */
const getPadByKeys = keys => item => Math.min(...keys.map(k => item[k]))

/**
 * Widen search range: setPad => padRange => paddedRange
 * @param {number} pad - Amount to widen range
 * @param {number[]} range - Minimum and maximun range values
 * @returns {number[]}
 */
const setPad = pad => ([min, max]) => [Math.max(min - pad, 0), max + pad]

/**
 * Get range array from Item object
 * @param {string[]} keys - Property names containing range values
 * @param {Object} item - Item
 * @returns {number[]} - Range: [min, max]
 */
const setRangeByKeys = keys => item =>
  keys.map(key => item[key]).sort((a, b) => a - b)

/**
 *
 * @param {string[]} paddingKeys - Property names used to calculate padding
 * @param {IntervalTree} tree - Interval Tree to search
 * @returns {Array[]} - Contains arrays of overlapping items
 */
const toGroups = paddingKeys => tree => {
  const { items, keys } = tree
  console.log('keys', keys)

  const getRange = setRangeByKeys(keys)
  const getPad = getPadByKeys(paddingKeys)

  const padRanges = items.map(getPad).map(setPad)
  const itemRanges = items.map(getRange)

  const paddedRanges = itemRanges.map((r, i) => padRanges[i](r))

  // Find adjacent items
  const results = paddedRanges.map(range =>
    tree
      .search(...range)
      .map(i => i.id)
      .sort()
  )

  return results
}

/**
 * Group items recursively
 * @param {IntervalTree[]} trees - Array of IntervalTrees
 * @param {Number|Function} fn - Number or Function that returns a number
 * @returns {Function} - A function that takes one function as a param.
 *    This function returns a value to use to expand the search range.
 */
const groupFromTrees = seedTrees => paddingKeys => {
  // Clone or create consumable trees from seedTrees
  const trees = _.cloneDeep(seedTrees)

  // Get clusters from each tree
  const resultsByTree = trees.map(toGroups(paddingKeys))
  // Get intersection of each tree result
  const resultsByItem = _.zip(...resultsByTree)
  console.log('resultsByItem', resultsByItem)
  const intersections = resultsByItem.map(([x, y]) => _.intersection(x, y))
  console.log('intersections', intersections)

  const groups = intersections.map(group => {
    const intersects = _.intersection(group)
    const groupSet = intersections.reduce((set, g) => {
      if (intersects(g)) {
        set.add(...g)
      }

      return set
    }, new Set(group))

    return [...groupSet].sort()
  })

  console.log('groups', groups)
  return groups
}

export default groupFromTrees
