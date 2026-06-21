import { defaultStationPositions } from "../constant/defaultNetworkLayout.js";

const mapWidth = 680;
const mapHeight = 430;

function generateFallbackPosition(index, total) {
  const radius = Math.min(mapWidth, mapHeight) * 0.35;
  const centerX = mapWidth / 2;
  const centerY = mapHeight / 2;
  const angle = (2 * Math.PI * index) / Math.max(total, 1);

  return {
    x: Math.round(centerX + radius * Math.cos(angle)),
    y: Math.round(centerY + radius * Math.sin(angle)),
  };
}

function getStationPosition(station, index, total) {
  return (
    defaultStationPositions[station.id] ??
    generateFallbackPosition(index, total)
  );
}

export function applyStationLayout(stations = []) {
  return stations.map((station, index) => ({
    ...station,
    ...getStationPosition(station, index, stations.length),
  }));
}

export function applyNetworkLayout(network) {
  return {
    ...network,
    stations: applyStationLayout(network.stations ?? []),
  };
}

export function applyEndpointLayout(station, laidOutStations = []) {
  const matchingStation = laidOutStations.find(
    (item) => item.id === station.id,
  );
  if (matchingStation) {
    return {
      ...station,
      x: matchingStation.x,
      y: matchingStation.y,
    };
  }

  return {
    ...station,
    ...getStationPosition(station, 0, 1),
  };
}
