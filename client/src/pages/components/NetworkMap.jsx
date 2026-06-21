import { useEffect, useMemo, useState } from "react";
import { Box, Chip, Paper, Stack } from "@mui/material";
import { throttle } from "../util.js";

const lineColors = [
  "#c23b3b",
  "#2457d6",
  "#147d63",
  "#d99a1e",
  "#7c3aed",
  "#0f766e",
];
const mapWidth = 680;
const mapHeight = 430;

const stationLabelOffset = 26;

const getLineColor = (lineId) => lineColors[(lineId - 1) % lineColors.length];
const isNarrowViewport = () =>
  typeof globalThis.innerWidth === "number" && globalThis.innerWidth < 640;

export function NetworkMap({
  currentStationId,
  destinationStationId,
  lines = [],
  segments = [],
  selectedRoute = [],
  showLineNames = true,
  showSegments = true,
  startStationId,
  stations = [],
}) {
  const [narrowViewport, setNarrowViewport] = useState(isNarrowViewport);
  const stationById = useMemo(
    () => new Map(stations.map((station) => [station.id, station])),
    [stations],
  );
  const selectedSegmentIds = useMemo(
    () => new Set(selectedRoute.map((step) => step.segmentId)),
    [selectedRoute],
  );

  useEffect(() => {
    const updateViewport = throttle(() => {
      setNarrowViewport(isNarrowViewport());
    }, 150);

    globalThis.addEventListener("resize", updateViewport);
    return () => globalThis.removeEventListener("resize", updateViewport);
  }, []);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
      <Box sx={{ bgcolor: "#f8fafc", overflowX: "auto", p: 2 }}>
        <Box sx={{ minWidth: mapWidth }}>
          <svg
            aria-label={
              showSegments
                ? "Full underground network map"
                : "Stations-only map"
            }
            role="img"
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            width="100%"
          >
            <rect fill="#f8fafc" height={mapHeight} rx="14" width={mapWidth} />
            {showSegments &&
              segments.map((segment) => {
                const a = stationById.get(segment.stationAId);
                const b = stationById.get(segment.stationBId);
                if (!a || !b) return null;

                const selected = selectedSegmentIds.has(segment.id);
                return (
                  <g key={segment.id}>
                    <line
                      stroke={
                        selected ? "#111827" : getLineColor(segment.lineId)
                      }
                      strokeLinecap="round"
                      strokeWidth={selected ? 8 : 5}
                      x1={a.x}
                      x2={b.x}
                      y1={a.y}
                      y2={b.y}
                    />
                    {showLineNames && (
                      <text
                        fill="#475569"
                        fontSize="10"
                        textAnchor="middle"
                        x={(a.x + b.x) / 2}
                        y={(a.y + b.y) / 2 - 8}
                      >
                        {segment.lineName}
                      </text>
                    )}
                  </g>
                );
              })}

            {stations.map((station) => {
              const isStart = station.id === startStationId;
              const isDestination = station.id === destinationStationId;
              const isCurrent = station.id === currentStationId;
              const fill = isStart
                ? "#147d63"
                : isDestination
                  ? "#c23b3b"
                  : "#ffffff";

              return (
                <g key={station.id}>
                  <circle
                    cx={station.x}
                    cy={station.y}
                    fill={isCurrent ? "#fef3c7" : fill}
                    r={station.isInterchange ? 11 : 8}
                    stroke={isCurrent ? "#d99a1e" : "#172033"}
                    strokeWidth={isCurrent ? 4 : 2}
                  />
                  <text
                    fill="#172033"
                    fontSize={narrowViewport ? "11" : "12"}
                    fontWeight="700"
                    textAnchor="middle"
                    x={station.x}
                    y={station.y + stationLabelOffset}
                  >
                    {station.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </Box>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        sx={{ flexWrap: "wrap", gap: 1, p: 2 }}
      >
        {showSegments &&
          lines.map((line) => (
            <Chip
              key={line.id}
              label={line.name}
              size="small"
              sx={{
                borderColor: getLineColor(line.id),
                color: getLineColor(line.id),
                fontWeight: 700,
              }}
              variant="outlined"
            />
          ))}
      </Stack>
    </Paper>
  );
}
