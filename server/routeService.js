export const INITIAL_COINS = 20;
export const PLANNING_SECONDS = 90;

export const buildGraph = (segments) => {
  const graph = new Map();
  for (const segment of segments) {
    if (!graph.has(segment.stationAId)) graph.set(segment.stationAId, []);
    if (!graph.has(segment.stationBId)) graph.set(segment.stationBId, []);
    graph.get(segment.stationAId).push(segment.stationBId);
    graph.get(segment.stationBId).push(segment.stationAId);
  }
  return graph;
};

export const shortestDistance = (graph, startId, destinationId) => {
  const queue = [{ stationId: startId, distance: 0 }];
  const visited = new Set([startId]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (current.stationId === destinationId) return current.distance;

    for (const nextStationId of graph.get(current.stationId) ?? []) {
      if (!visited.has(nextStationId)) {
        visited.add(nextStationId);
        queue.push({
          stationId: nextStationId,
          distance: current.distance + 1,
        });
      }
    }
  }

  return Number.POSITIVE_INFINITY;
};

export const selectStartAndDestination = (network) => {
  const graph = buildGraph(network.segments);
  const candidates = [];

  for (const start of network.stations) {
    for (const destination of network.stations) {
      if (start.id === destination.id) continue;
      if (shortestDistance(graph, start.id, destination.id) >= 3) {
        candidates.push({ start, destination });
      }
    }
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
};

export const toPlanningPayload = (network) => ({
  stations: network.stations,
  segments: network.segments.map((segment) => ({
    id: segment.id,
    stationAId: segment.stationAId,
    stationAName: segment.stationAName,
    stationBId: segment.stationBId,
    stationBName: segment.stationBName,
  })),
});

const getSegmentMap = (network) =>
  new Map(network.segments.map((segment) => [segment.id, segment]));

const getStationMap = (network) =>
  new Map(network.stations.map((station) => [station.id, station]));

const buildSelectedAdjacency = (segments) => {
  const adjacency = new Map();

  for (const segment of segments) {
    const addEdge = (stationId, otherStationId) => {
      if (!adjacency.has(stationId)) adjacency.set(stationId, []);
      adjacency.get(stationId).push({
        segment,
        otherStationId,
      });
    };

    addEdge(segment.stationAId, segment.stationBId);
    addEdge(segment.stationBId, segment.stationAId);
  }

  return adjacency;
};

const findValidOrderedRoute = (segments, game, stationMap) => {
  const adjacency = buildSelectedAdjacency(segments);
  const targetSegmentCount = segments.length;
  let blockedByLineChange = false;

  const search = ({
    currentStationId,
    orderedRoute,
    previousLineId,
    usedSegmentIds,
  }) => {
    if (usedSegmentIds.size === targetSegmentCount) {
      return currentStationId === game.destinationStation.id
        ? orderedRoute
        : undefined;
    }

    for (const edge of adjacency.get(currentStationId) ?? []) {
      const { segment, otherStationId } = edge;
      if (usedSegmentIds.has(segment.id)) continue;

      if (
        previousLineId &&
        previousLineId !== segment.lineId &&
        !stationMap.get(currentStationId)?.isInterchange
      ) {
        blockedByLineChange = true;
        continue;
      }

      const nextUsedSegmentIds = new Set(usedSegmentIds);
      nextUsedSegmentIds.add(segment.id);

      const result = search({
        currentStationId: otherStationId,
        orderedRoute: [
          ...orderedRoute,
          {
            segmentId: segment.id,
            fromStationId: currentStationId,
            toStationId: otherStationId,
          },
        ],
        previousLineId: segment.lineId,
        usedSegmentIds: nextUsedSegmentIds,
      });

      if (result) return result;
    }

    return undefined;
  };

  const orderedRoute = search({
    currentStationId: game.startStation.id,
    orderedRoute: [],
    previousLineId: undefined,
    usedSegmentIds: new Set(),
  });

  return { blockedByLineChange, orderedRoute };
};

export const validateRoute = (route, game, network) => {
  if (!Array.isArray(route) || route.length === 0) {
    return { valid: false, reason: "The route is empty or incomplete." };
  }

  const segmentMap = getSegmentMap(network);
  const stationMap = getStationMap(network);
  const usedSegments = new Set();
  const selectedSegments = [];

  for (const step of route) {
    const segment = segmentMap.get(step.segmentId);
    if (!segment)
      return { valid: false, reason: "The route contains an unknown segment." };
    if (usedSegments.has(step.segmentId))
      return { valid: false, reason: "A segment is used more than once." };

    usedSegments.add(step.segmentId);
    selectedSegments.push(segment);
  }

  const { blockedByLineChange, orderedRoute } = findValidOrderedRoute(
    selectedSegments,
    game,
    stationMap,
  );
  if (!orderedRoute) {
    return {
      valid: false,
      reason: blockedByLineChange
        ? "Line changes are allowed only at interchange stations."
        : "The selected segments cannot form a valid route.",
    };
  }

  return { valid: true, orderedRoute };
};

export const runExecution = (route, events) => {
  let coins = INITIAL_COINS;

  return route.map((step, index) => {
    const event = events[Math.floor(Math.random() * events.length)];
    coins += event.effect;
    return {
      order: index + 1,
      segmentId: step.segmentId,
      fromStationId: step.fromStationId,
      toStationId: step.toStationId,
      event,
      coins,
    };
  });
};
