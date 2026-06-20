export function debounce(callback, wait = 300) {
  let timeoutId

  const debounced = (...args) => {
    globalThis.clearTimeout(timeoutId)
    timeoutId = globalThis.setTimeout(() => callback(...args), wait)
  }

  debounced.cancel = () => globalThis.clearTimeout(timeoutId)

  return debounced
}

export function throttle(callback, wait = 300) {
  let lastRun = 0

  return (...args) => {
    const now = Date.now()
    if (now - lastRun < wait) return undefined

    lastRun = now
    return callback(...args)
  }
}
