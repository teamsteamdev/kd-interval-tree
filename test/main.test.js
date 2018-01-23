/* eslint-env jest */
import _ from 'lodash/fp'
import createTrees from '../src/main'

const items = [
  { id: 0, bottom: 2, top: 4, left: 2, right: 4, height: 2, width: 2 },
  { id: 1, bottom: 5, top: 6, left: 5, right: 6, height: 1, width: 1 },
  { id: 2, bottom: 1, top: 2, left: 1, right: 2, height: 1, width: 1 },
  { id: 3, bottom: 0, top: 10, left: 0, right: 1, height: 10, width: 1 }
]

const items2 = [
  { id: 4, bottom: 8, top: 9, left: 8, right: 9, height: 1, width: 1 },
  { id: 5, bottom: 8, top: 9, left: 9, right: 10, height: 1, width: 1 },
  { id: 6, bottom: 9, top: 10, left: 8, right: 9, height: 1, width: 1 },
  { id: 7, bottom: 9, top: 10, left: 9, right: 10, height: 1, width: 1 },
  { id: 8, bottom: 0, top: 1, left: 1, right: 10, height: 1, width: 9 }
]

const allItems = [...items, ...items2]

const keys = ['left', 'right', 'bottom', 'top']

it('should create trees', () => {
  const result = createTrees(keys, items)
  expect(result).toBeInstanceOf(Function)
  expect(result.count).toBe(2) // Two trees
  expect(result.trees.length).toBe(result.count)
  expect(result.trees[0].count).toBe(4)
  expect(result.trees[1].count).toBe(4)
})

it('should search all trees', () => {
  const searchTrees = createTrees(keys, items)
  const result = searchTrees(_.intersection, [0, 2, 0, 2])
  expect(result).toBeInstanceOf(Array)
  expect(result.length).toBe(3)
  expect(result).toContain(items[0])
  expect(result).toContain(items[2])
  expect(result).toContain(items[3])
})

it.only('should group clusters of items', () => {
  const searchTrees = createTrees(keys, allItems)
  expect(searchTrees.getGroups).toBeInstanceOf(Function)

  const result = searchTrees.getGroups(['height', 'width'])
  expect(result).toBeInstanceOf(Array)
  // expect(result).toEqual([items, items2])
})
