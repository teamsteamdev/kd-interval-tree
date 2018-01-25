/* eslint-env jest */
import _ from 'lodash/fp'
import { getRange, expandRange, operateIfAny } from '../src/group.utils'

it('should get range values from item', () => {
  const partial = getRange([['left', 'right'], ['bottom', 'top']])
  expect(partial).toBeInstanceOf(Function)

  const result = partial({ left: 7, right: 10, bottom: 8, top: 9 })
  expect(result).toEqual([[7, 10], [8, 9]])
})

it('should expand ranges by smallest range size', () => {
  const partial = expandRange(Math.min)
  expect(partial).toBeInstanceOf(Function)

  const result = partial([[5, 6], [4, 8]])
  expect(result).toEqual([[4, 7], [3, 9]])
})

it('should return the union of items1 and items2', () => {
  const partial1 = operateIfAny(_.union)
  expect(partial1).toBeInstanceOf(Function)

  const partial2 = partial1(_.intersection)
  expect(partial2).toBeInstanceOf(Function)

  const items1 = [
    { id: 0, bottom: 2, top: 4, left: 2, right: 4 },
    { id: 1, bottom: 5, top: 6, left: 5, right: 6 }
  ]

  const items2 = [
    { id: 1, bottom: 5, top: 6, left: 5, right: 6 },
    { id: 2, bottom: 1, top: 2, left: 1, right: 2 }
  ]

  const result = partial2(items1, items2)
  expect(result).toEqual([
    { id: 0, bottom: 2, top: 4, left: 2, right: 4 },
    { id: 1, bottom: 5, top: 6, left: 5, right: 6 },
    { id: 2, bottom: 1, top: 2, left: 1, right: 2 }
  ])
})

it('should return items1', () => {
  const partial1 = operateIfAny(_.union)
  const partial2 = partial1(_.intersection)

  const items1 = [
    { id: 0, bottom: 2, top: 4, left: 2, right: 4 },
    { id: 1, bottom: 5, top: 6, left: 5, right: 6 }
  ]

  const items2 = [
    { id: 2, bottom: 1, top: 2, left: 1, right: 2 },
    { id: 3, bottom: 0, top: 10, left: 0, right: 1 }
  ]

  const result = partial2(items1, items2)
  expect(result).toBe(items1)
})
