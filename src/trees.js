import curry from 'lodash/fp/curry'
import IntervalTree from 'node-interval-tree'

/**
 * Once the initial params are applied, use in Array.map to populate an interval tree.
 *
 * @param {IntervalTree} tree - IntervalTree from 'node-interval-tree'
 * @param {string} lowKey - Low interval key name
 * @param {string} highKey - High interval key name
 */
const addToTree = curry((tree, [lowKey, highKey], item) => {
  const values = [item[lowKey], item[highKey]]
  const [low, high] = [Math.min(...values), Math.max(...values)]
  tree.insert(low, high, item)
})

const createTrees = (rangeKeys, items) => {
  const trees = rangeKeys.map(keys => {
    const tree = new IntervalTree()
    const add = addToTree(tree, keys)

    items.forEach(add)
    tree.keys = keys
    tree.items = items
    return tree
  })

  trees.keys = rangeKeys
  trees.items = items

  return trees
}

export default createTrees
