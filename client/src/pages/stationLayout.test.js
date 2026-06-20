import assert from 'node:assert/strict'
import test from 'node:test'
import { shuffleStationPositions } from './stationLayout.js'

const stations = [
  { id: 1, name: 'A', x: 10, y: 10 },
  { id: 2, name: 'B', x: 20, y: 20 },
  { id: 3, name: 'C', x: 30, y: 30 },
  { id: 4, name: 'D', x: 40, y: 40 },
]

test('planning station positions are shuffled consistently for a game', () => {
  const firstLayout = shuffleStationPositions(stations, 42)
  const secondLayout = shuffleStationPositions(stations, 42)

  assert.deepEqual(firstLayout, secondLayout)
  assert.deepEqual(firstLayout.map((station) => station.id), [1, 2, 3, 4])
  assert.ok(
    firstLayout.some(
      (station, index) =>
        station.x !== stations[index].x || station.y !== stations[index].y,
    ),
  )
})
