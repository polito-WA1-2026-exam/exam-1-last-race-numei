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

  assert.deepEqual(apiInternals.validateRoute(validRoute, game, network), { valid: true });
  assert.equal(apiInternals.validateRoute([], game, network).valid, false);
  assert.equal(apiInternals.validateRoute([{ segmentId: 999, fromStationId: 1, toStationId: 2 }], game, network).valid, false);
  assert.equal(apiInternals.validateRoute([validRoute[0], validRoute[0]], game, network).valid, false);
});
