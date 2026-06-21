import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { app, apiInternals } from "./index.js";
import { getNetwork } from "./dao.js";

test("all README API routes are registered", () => {
  const routes = app.router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods).sort(),
    }));

  assert.deepEqual(routes, [
    { path: "/api/sessions", methods: ["post"] },
    { path: "/api/sessions/current", methods: ["get"] },
    { path: "/api/sessions/current", methods: ["delete"] },
    { path: "/api/network", methods: ["get"] },
    { path: "/api/games", methods: ["post"] },
    { path: "/api/games/:gameId/submit", methods: ["post"] },
    { path: "/api/games/:gameId/result", methods: ["get"] },
    { path: "/api/ranking", methods: ["get"] },
  ]);
});

test("new game selection returns stations at least 3 segments apart and hides planning-only data", async () => {
  execFileSync("node", ["init-db.js"], { cwd: import.meta.dirname });
  const network = await getNetwork();
  const { start, destination } = apiInternals.selectStartAndDestination(network);
  const graph = apiInternals.buildGraph(network.segments);
  const planningPayload = apiInternals.toPlanningPayload(network);

  assert.ok(apiInternals.shortestDistance(graph, start.id, destination.id) >= 3);
  assert.equal(planningPayload.lines, undefined);
  assert.equal(planningPayload.events, undefined);
  assert.equal(planningPayload.stations.length, 12);
  assert.ok(planningPayload.segments.every((segment) => segment.lineId === undefined));
});

test("basic route validation checks endpoints, continuity, known segments, and duplicates", async () => {
  execFileSync("node", ["init-db.js"], { cwd: import.meta.dirname });
  const network = await getNetwork();
  const game = {
    startStation: { id: 1 },
    destinationStation: { id: 4 },
  };
  const validRoute = [
    { segmentId: 1, fromStationId: 1, toStationId: 2 },
    { segmentId: 2, fromStationId: 2, toStationId: 3 },
    { segmentId: 3, fromStationId: 3, toStationId: 4 },
  ];

  assert.deepEqual(apiInternals.validateRoute(validRoute, game, network), {
    valid: true,
    orderedRoute: validRoute,
  });
  assert.equal(apiInternals.validateRoute([], game, network).valid, false);
  assert.equal(apiInternals.validateRoute([{ segmentId: 999, fromStationId: 1, toStationId: 2 }], game, network).valid, false);
  assert.equal(apiInternals.validateRoute([validRoute[0], validRoute[0]], game, network).valid, false);
});

test("route validation allows line changes only at interchange stations", async () => {
  execFileSync("node", ["init-db.js"], { cwd: import.meta.dirname });
  const network = await getNetwork();

  const interchangeChangeGame = {
    startStation: { id: 1 },
    destinationStation: { id: 5 },
  };
  const interchangeChangeRoute = [
    { segmentId: 1, fromStationId: 1, toStationId: 2 },
    { segmentId: 8, fromStationId: 2, toStationId: 5 },
  ];
  assert.deepEqual(
    apiInternals.validateRoute(interchangeChangeRoute, interchangeChangeGame, network),
    {
      valid: true,
      orderedRoute: interchangeChangeRoute,
    },
  );

  const nonInterchangeChangeGame = {
    startStation: { id: 4 },
    destinationStation: { id: 6 },
  };
  const nonInterchangeChangeRoute = [
    { segmentId: 11, fromStationId: 4, toStationId: 7 },
    { segmentId: 7, fromStationId: 7, toStationId: 6 },
  ];
  assert.deepEqual(
    apiInternals.validateRoute(nonInterchangeChangeRoute, nonInterchangeChangeGame, network),
    {
      valid: false,
      reason: "Line changes are allowed only at interchange stations.",
    },
  );
});

test("route validation rebuilds a valid ordered route from unordered selected segments", async () => {
  execFileSync("node", ["init-db.js"], { cwd: import.meta.dirname });
  const network = await getNetwork();
  const game = {
    startStation: { id: 1 },
    destinationStation: { id: 4 },
  };
  const unorderedRoute = [
    { segmentId: 3, fromStationId: 99, toStationId: 98 },
    { segmentId: 1, fromStationId: 97, toStationId: 96 },
    { segmentId: 2, fromStationId: 95, toStationId: 94 },
  ];

  assert.deepEqual(apiInternals.validateRoute(unorderedRoute, game, network), {
    valid: true,
    orderedRoute: [
      { segmentId: 1, fromStationId: 1, toStationId: 2 },
      { segmentId: 2, fromStationId: 2, toStationId: 3 },
      { segmentId: 3, fromStationId: 3, toStationId: 4 },
    ],
  });
});

test("route validation rejects selected segment sets that contain unused extra edges", async () => {
  execFileSync("node", ["init-db.js"], { cwd: import.meta.dirname });
  const network = await getNetwork();
  const game = {
    startStation: { id: 1 },
    destinationStation: { id: 4 },
  };
  const routeWithExtraSegment = [
    { segmentId: 1 },
    { segmentId: 2 },
    { segmentId: 3 },
    { segmentId: 15 },
  ];

  assert.deepEqual(apiInternals.validateRoute(routeWithExtraSegment, game, network), {
    valid: false,
    reason: "The selected segments cannot form a valid route.",
  });
});
