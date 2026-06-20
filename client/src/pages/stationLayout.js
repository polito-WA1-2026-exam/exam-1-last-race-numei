const hashSeed = (value) =>
  String(value)
    .split('')
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 2166136261)

const nextRandom = (seed) => (seed * 1664525 + 1013904223) >>> 0

const shuffledIndexes = (length, seedValue) => {
  const indexes = Array.from({ length }, (_, index) => index)
  let seed = hashSeed(seedValue)

  for (let index = indexes.length - 1; index > 0; index -= 1) {
    seed = nextRandom(seed)
    const swapIndex = seed % (index + 1)
    ;[indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]]
  }

  return indexes
}

export function shuffleStationPositions(stations, seedValue) {
  if (stations.length < 2) return stations

  let indexes = shuffledIndexes(stations.length, seedValue)
  if (indexes.every((positionIndex, index) => positionIndex === index)) {
    indexes = indexes.slice(1).concat(indexes[0])
  }

  return stations.map((station, index) => {
    const position = stations[indexes[index]]
    return {
      ...station,
      x: position.x,
      y: position.y,
    }
  })
}
