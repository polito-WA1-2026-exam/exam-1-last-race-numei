export const getRouteEndStationId = (route, startStationId) =>
  route.at(-1)?.toStationId ?? startStationId

const buildRouteStep = (segment, fromStationId) => {
  if (segment.stationAId === fromStationId) {
    return {
      segmentId: segment.id,
      fromStationId,
      toStationId: segment.stationBId,
    }
  }
  if (segment.stationBId === fromStationId) {
    return {
      segmentId: segment.id,
      fromStationId,
      toStationId: segment.stationAId,
    }
  }

  return {
    segmentId: segment.id,
    fromStationId: segment.stationAId,
    toStationId: segment.stationBId,
  }
}

export const selectRouteSegment = (route, startStationId, segment) => {
  if (route.some((step) => step.segmentId === segment.id)) {
    return {
      route,
      error: 'This segment has already been selected.',
    }
  }

  const fromStationId = getRouteEndStationId(route, startStationId)
  return {
    route: [...route, buildRouteStep(segment, fromStationId)],
    error: '',
  }
}
