/**
 * Once the initial params are applied, use in Array.map to populate an interval tree, returning true or an Error if the operation was not successful.
 *
 * @param {IntervalTree} tree - IntervalTree from 'node-interval-tree'
 * @param {string} lowKey - Low interval key name
 * @param {string} highKey - High interval key name
 * @returns {function(item): true|Error} true or an Error if the item was not added to the tree
 */
const addToTree = (tree, lowKey, highKey) => item => {
  const [low, high] = [item[lowKey], item[highKey]].sort((a, b) => a - b)
  const inserted = tree.insert(low, high, item)
  return (
    inserted ||
    new Error(`${item} was not inserted into ${lowKey}, ${highKey} tree.`)
  )
}

export default addToTree
