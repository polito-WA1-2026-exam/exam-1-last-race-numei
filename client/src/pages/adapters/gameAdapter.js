const transformStationDTOtoVO = (stationDto) => ({
  id: stationDto.id,
  name: stationDto.name,
  isInterchange: Boolean(stationDto.isInterchange),
  x: stationDto.x,
  y: stationDto.y,
})

const transformLineDTOtoVO = (lineDto) => ({
  id: lineDto.id,
  name: lineDto.name,
})

const transformSegmentDTOtoVO = (segmentDto) => ({
  id: segmentDto.id,
  lineId: segmentDto.lineId,
  lineName: segmentDto.lineName,
  stationAId: segmentDto.stationAId,
  stationAName: segmentDto.stationAName,
  stationBId: segmentDto.stationBId,
  stationBName: segmentDto.stationBName,
})

export function transformNetworkDTOtoVO(networkDto = {}) {
  return {
    stations: (networkDto.stations ?? []).map(transformStationDTOtoVO),
    lines: (networkDto.lines ?? []).map(transformLineDTOtoVO),
    segments: (networkDto.segments ?? []).map(transformSegmentDTOtoVO),
  }
}

export function transformGameDTOtoVO(gameDto) {
  const planningNetwork = transformNetworkDTOtoVO(gameDto)

  return {
    gameId: gameDto.gameId,
    initialCoins: gameDto.initialCoins,
    planningSeconds: gameDto.planningSeconds,
    planningDeadline: gameDto.planningDeadline,
    startStation: transformStationDTOtoVO(gameDto.startStation),
    destinationStation: transformStationDTOtoVO(gameDto.destinationStation),
    stations: planningNetwork.stations,
    segments: planningNetwork.segments,
  }
}

export function transformResultDTOtoVO(resultDto) {
  if (!resultDto) return undefined

  return {
    gameId: resultDto.gameId,
    dbGameId: resultDto.dbGameId,
    valid: Boolean(resultDto.valid),
    reason: resultDto.reason,
    steps: resultDto.steps ?? [],
    finalScore: resultDto.finalScore ?? resultDto.score ?? 0,
  }
}

export function transformRankingDTOtoVO(rankingDto = []) {
  return rankingDto.map((row, index) => ({
    position: index + 1,
    userId: row.userId,
    username: row.username,
    name: row.name,
    bestScore: row.bestScore,
  }))
}
