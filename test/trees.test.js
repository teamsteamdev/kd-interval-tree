/* eslint-env jest */
import createTrees from '../src/trees'

import IntervalTree from 'node-interval-tree'

describe('createTrees', () => {
  it('should create an array of trees', () => {
    const rangeKeys = [['left', 'right'], ['bottom', 'top']]

    const items = [
      {
        id: 0,
        bottom: 2,
        top: 4,
        left: 2,
        right: 4,
        height: 2,
        width: 2,
      },
      {
        id: 1,
        bottom: 5,
        top: 6,
        left: 5,
        right: 6,
        height: 1,
        width: 1,
      },
      {
        id: 2,
        bottom: 1,
        top: 2,
        left: 1,
        right: 2,
        height: 1,
        width: 1,
      },
      {
        id: 3,
        bottom: 0,
        top: 10,
        left: 0,
        right: 1,
        height: 10,
        width: 1,
      },
      {
        id: 8,
        bottom: 0,
        top: 1,
        left: 1,
        right: 10,
        height: 1,
        width: 9,
      },
    ]

    const result = createTrees(rangeKeys, items)

    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBe(rangeKeys.length)

    expect(result[0]).toBeInstanceOf(IntervalTree)
    expect(result[0].search(2, 4)).toContain(items[0])

    expect(result[0].keys).toBe(rangeKeys[0])
    expect(result[0].items).toBe(items)
    expect(result[0].count).toBe(5)
  })
})
