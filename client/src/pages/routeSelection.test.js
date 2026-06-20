import assert from 'node:assert/strict'
import test from 'node:test'
import { selectRouteSegment } from './routeSelection.js'

const startStationId = 1
const firstSegment = { id: 10, stationAId: 1, stationBId: 2 }
const secondSegment = { id: 11, stationAId: 2, stationBId: 3 }
const disconnectedSegment = { id: 12, stationAId: 4, stationBId: 5 }

test('planning route blocks duplicates and leaves continuity validation to the server', () => {
  const firstSelection = selectRouteSegment([], startStationId, firstSegment)
  assert.deepEqual(firstSelection.route, [
    { segmentId: 10, fromStationId: 1, toStationId: 2 },
  ])
  assert.equal(firstSelection.error, '')

  const duplicateSelection = selectRouteSegment(
    firstSelection.route,
    startStationId,
    firstSegment,
  )
  assert.equal(duplicateSelection.route, firstSelection.route)
  assert.equal(duplicateSelection.error, 'This segment has already been selected.')

  const disconnectedSelection = selectRouteSegment(
    firstSelection.route,
    startStationId,
    disconnectedSegment,
  )
  assert.deepEqual(disconnectedSelection.route, [
    { segmentId: 10, fromStationId: 1, toStationId: 2 },
    { segmentId: 12, fromStationId: 4, toStationId: 5 },
  ])
  assert.equal(disconnectedSelection.error, '')

  const secondSelection = selectRouteSegment(
    firstSelection.route,
    startStationId,
    secondSegment,
  )
  assert.deepEqual(secondSelection.route, [
    { segmentId: 10, fromStationId: 1, toStationId: 2 },
    { segmentId: 11, fromStationId: 2, toStationId: 3 },
  ])
  assert.equal(secondSelection.error, '')
})
