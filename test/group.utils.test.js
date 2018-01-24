/* eslint-env jest */
import _ from 'lodash/fp'
import { expandRange, getRange, operateIfAny } from '../src/group.utils'

const range1 = [5, 6]
const range2 = [4, 8]
const ranges = [range1, range2]

const xKeys = ['left', 'right']
const yKeys = ['bottom', 'top']
const keys = [xKeys, yKeys]

const item = { left: 7, right: 10, bottom: 8, top: 9 }

const items1 = [
  { id: 0, bottom: 2, top: 4, left: 2, right: 4, height: 2, width: 2 },
  { id: 1, bottom: 5, top: 6, left: 5, right: 6, height: 1, width: 1 },
  { id: 2, bottom: 1, top: 2, left: 1, right: 2, height: 1, width: 1 },
  { id: 3, bottom: 0, top: 10, left: 0, right: 1, height: 10, width: 1 },
  { id: 8, bottom: 0, top: 1, left: 1, right: 10, height: 1, width: 9 }
]

const items2 = [
  { id: 4, bottom: 8, top: 9, left: 8, right: 9, height: 1, width: 1 },
  { id: 5, bottom: 8, top: 9, left: 9, right: 10, height: 1, width: 1 },
  { id: 6, bottom: 9, top: 10, left: 8, right: 9, height: 1, width: 1 },
  { id: 7, bottom: 9, top: 10, left: 9, right: 10, height: 1, width: 1 }
]

const allItems = [...items1, ...items2]

it('should expand ranges by smallest range size', () => {
  const partial = expandRange(Math.min)
  expect(partial).toBeInstanceOf(Function)

  const result = partial(ranges)
  expect(result).toEqual([[4, 7], [3, 9]])
})

it('should get range values from item', () => {
  const partial = getRange(keys)
  expect(partial).toBeInstanceOf(Function)

  const result = partial(item)
  expect(result).toEqual([[7, 10], [8, 9]])
})

it('should return the union of items1 and items2', () => {
  const partial1 = operateIfAny(_.union)
  expect(partial1).toBeInstanceOf(Function)

  const partial2 = partial1(_.intersection)
  expect(partial2).toBeInstanceOf(Function)

  const result = partial2(items1, items2)

  /**
   * operateIfAny will be used in a reducer
   * The reducer will be the first array
   * Each array in the parent array will be
   * compared with the reducer but
   * the reducer will be unified with the array
   * if fn1 :: result.length > 0
   */
})

it('should not return the union of items1 and items3', () => {
  const partial1 = operateIfAny(_.union)
  const partial2 = partial1(_.intersection)
  const result = partial2(items1, items3)
})
