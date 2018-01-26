/* eslint-env jest */
// import _ from 'lodash/fp'

import createTrees from '../src/trees'
import createSearchTrees from '../src/search'
import { getAdjacent, getClusters } from '../src/group'

describe('getAdjacent', () => {
  it('should get all items adjacent to an item', () => {
    const rangeKeys = [['left', 'right'], ['bottom', 'top']]

    const items1 = [
      { id: 0, bottom: 2, top: 4, left: 2, right: 4 },
      { id: 1, bottom: 5, top: 6, left: 5, right: 6 },
      { id: 2, bottom: 1, top: 2, left: 1, right: 2 },
      { id: 3, bottom: 0, top: 10, left: 0, right: 1 },
      { id: 8, bottom: 0, top: 1, left: 1, right: 10 }
    ]

    const items2 = [
      { id: 4, bottom: 8, top: 9, left: 8, right: 9 },
      { id: 5, bottom: 8, top: 9, left: 9, right: 10 },
      { id: 6, bottom: 9, top: 10, left: 8, right: 9 },
      { id: 7, bottom: 9, top: 10, left: 9, right: 10 }
    ]

    const trees = createTrees(rangeKeys, [...items1, ...items2])
    const searchTrees = createSearchTrees(trees)
    const getAdjacentByItem = getAdjacent(searchTrees)

    const result = getAdjacentByItem(items1[0])

    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBe(items1.length)
    expect(result).toContain(items1[0])
    expect(result).toContain(items1[1])
    expect(result).toContain(items1[2])
    expect(result).toContain(items1[3])
    expect(result).toContain(items1[4])
    expect(result).not.toContain(items2[0])
    expect(result).not.toContain(items2[1])
    expect(result).not.toContain(items2[2])
    expect(result).not.toContain(items2[3])
  })
})

describe('getClusters', () => {
  it('should group all contiguous items', () => {
    const rangeKeys = [['left', 'right'], ['bottom', 'top']]

    const items1 = [
      { id: 0, bottom: 2, top: 4, left: 2, right: 4 },
      { id: 1, bottom: 5, top: 6, left: 5, right: 6 },
      { id: 2, bottom: 1, top: 2, left: 1, right: 2 },
      { id: 3, bottom: 0, top: 10, left: 0, right: 1 },
      { id: 8, bottom: 0, top: 1, left: 1, right: 10 }
    ]

    const items2 = [
      { id: 4, bottom: 8, top: 9, left: 8, right: 9 },
      { id: 5, bottom: 8, top: 9, left: 9, right: 10 },
      { id: 6, bottom: 9, top: 10, left: 8, right: 9 },
      { id: 7, bottom: 9, top: 10, left: 9, right: 10 }
    ]

    const trees = createTrees(rangeKeys, [...items1, ...items2])
    const searchTrees = createSearchTrees(trees)
    const getAdjacentByItem = getAdjacent(searchTrees)
    const adjacentByItem = trees.items.map(getAdjacentByItem)
    const result = getClusters(adjacentByItem)

    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBe(2)
  })
})
