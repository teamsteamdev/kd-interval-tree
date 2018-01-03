export default array =>
  array.reduce((reducer, element, index, array) => {
    const isEven = index % 2 === 0

    if (isEven) {
      const next = array[index + 1]
      const pair = next ? [element, next] : [element]
      return [...reducer, pair]
    }

    return reducer
  }, [])
