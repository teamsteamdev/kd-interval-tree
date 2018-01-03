/* eslint-env jest */
import _ from 'lodash/fp'
import createTrees from '../src/main'

const items = [
  { bottom: 2, top: 4, left: 2, right: 4 },
  { bottom: 5, top: 6, left: 5, right: 6 },
  { bottom: 1, top: 2, left: 1, right: 2 },
  { bottom: 0, top: 10, left: 0, right: 1 }
]

const keys = ['bottom', 'top', 'left', 'right']

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
