/* eslint-env jest */
import _ from 'lodash/fp'
import {
  getRanges,
  expandRanges,
  callIfLength,
  hasSameItems,
  uniqueSets,
} from '../src/group.utils'

describe('getRanges', () => {
  it('should get range values from item', () => {
    const partial = getRanges([
      ['left', 'right'],
      ['bottom', 'top'],
    ])
    expect(partial).toBeInstanceOf(Function)

    const result = partial({
      left: 7,
      right: 10,
      bottom: 8,
      top: 9,
    })
    expect(result).toEqual([[7, 10], [8, 9]])
  })
})

describe('expandRanges', () => {
  it('should expand ranges by smallest range size', () => {
    const partial = expandRanges(Math.min)
    expect(partial).toBeInstanceOf(Function)

    const result1 = partial([[5, 6], [4, 8]])
    expect(result1).toEqual([[4, 7], [3, 9]])

    const result2 = partial([[5, 6], [4, 8]])
    expect(result2).toEqual([[4, 7], [3, 9]])
  })
})

describe('callIfLength', () => {
  it('should return the union of Sets A and B', () => {
    const partial1 = callIfLength(_.intersection)
    expect(partial1).toBeInstanceOf(Function)

    const partial2 = partial1(_.union)
    expect(partial2).toBeInstanceOf(Function)

    const result = partial2([1, 2], [2, 3])
    expect(result).toContain(1)
    expect(result).toContain(2)
    expect(result).toContain(3)
    expect(result.length).toBe(3)
  })

  it('should return only Set A', () => {
    const partial1 = callIfLength(_.intersection)
    expect(partial1).toBeInstanceOf(Function)

    const partial2 = partial1(_.union)
    expect(partial2).toBeInstanceOf(Function)

    const result = partial2([1, 2], [3, 4])
    expect(result).toContain(1)
    expect(result).toContain(2)
    expect(result).not.toContain(3)
    expect(result).not.toContain(4)
    expect(result.length).toBe(2)
  })
})

describe('hasSameItems', () => {
  it('should return true if arrays have same elements', () => {
    const set1 = [1, 2, 3]
    const set2 = [3, 2, 1]
    expect(hasSameItems(set1, set2)).toBeTruthy()
  })

  it('should return false if arrays have different elements', () => {
    const set1 = [1, 2, 4]
    const set2 = [3, 2, 1]
    expect(hasSameItems(set1, set2)).toBeFalsy()
  })
})

describe('uniqueSets', () => {
  it('should remove duplicate set arrays', () => {
    const set1 = [1, 2, 3]
    const set2 = [3, 2, 1]
    const set3 = [4, 5, 6]
    const result = uniqueSets([set1, set2, set3])

    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBe(2)
    expect(result).toContain(set1)
    expect(result).toContain(set3)
  })
})
