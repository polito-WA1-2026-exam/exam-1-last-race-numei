import assert from 'node:assert/strict'
import test from 'node:test'
import { transformGameDTOtoVO, transformNetworkDTOtoVO } from './gameAdapter.js'

const networkDto = {
  stations: [
    { id: 1, name: 'Centrale', isInterchange: 1 },
    { id: 99, name: 'New Station', isInterchange: 0 },
  ],
  lines: [{ id: 1, name: 'Red Line' }],
  segments: [{ id: 1, lineId: 1, stationAId: 1, stationBId: 99 }],
}

test('network adapter applies front-end station layout to topology DTOs', () => {
  const network = transformNetworkDTOtoVO(networkDto)

  assert.deepEqual(network.stations[0], {
    id: 1,
    name: 'Centrale',
    isInterchange: true,
    x: 120,
    y: 90,
  })
  assert.equal(Number.isFinite(network.stations[1].x), true)
  assert.equal(Number.isFinite(network.stations[1].y), true)
})

test('game adapter applies layout to planning stations and endpoint stations', () => {
  const game = transformGameDTOtoVO({
    ...networkDto,
    gameId: 7,
    initialCoins: 20,
    planningSeconds: 90,
    planningDeadline: '2026-06-21T10:00:00.000Z',
    startStation: networkDto.stations[0],
    destinationStation: networkDto.stations[1],
  })

  assert.equal(game.startStation.x, 120)
  assert.equal(game.startStation.y, 90)
  assert.equal(Number.isFinite(game.destinationStation.x), true)
  assert.equal(Number.isFinite(game.destinationStation.y), true)
  assert.equal(Number.isFinite(game.stations[1].x), true)
  assert.equal(Number.isFinite(game.stations[1].y), true)
})
