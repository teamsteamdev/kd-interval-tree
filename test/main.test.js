/* eslint-env jest */
import _ from 'lodash/fp'
import createTrees from '../src/main'

const items = [
  { top: 4, right: 4, bottom: 2, left: 2 },
  { top: 6, right: 6, bottom: 5, left: 5 },
  { top: 2, right: 2, bottom: 1, left: 1 },
  { top: 10, right: 10, bottom: 0, left: 0 }
]

const keys = ['bottom', 'top', 'left', 'right']
// const ranges = [0, 2, 0, 2]

it('should create trees', () => {
  const result = createTrees(keys, items)
  expect(result).toBeInstanceOf(Function)
  expect(result.count).toBe(2)
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

it('should search one tree', () => {
  const searchTrees = createTrees(keys, items)
  const result = searchTrees(_.without, [0, 1])
  expect(result).toBeInstanceOf(Array)
  expect(result.length).toBe(2)
  expect(result).toContain(items[0])
  expect(result).toContain(items[1])
})
