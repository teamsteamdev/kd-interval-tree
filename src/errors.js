import _isError from 'lodash/isError'

const logError = x => {
  const isError = _isError(x)
  if (isError) {
    console.error(x)
  }
  return !isError
}

export default logError
