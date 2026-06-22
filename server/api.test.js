import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { app, apiInternals } from "./index.js";
import { getNetwork } from "./dao.js";

const withTestServer = async (run) => {
  const server = app.listen(0);
  try {
    const { port } = server.address();
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  }
};

const login = async (baseUrl) => {
  const response = await fetch(`${baseUrl}/api/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "alice", password: "password" }),
  });

  assert.equal(response.status, 201);
  return response.headers.get("set-cookie");
};

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

  const nonInterchangeNetwork = {
    stations: [
      { id: 1, isInterchange: false },
      { id: 2, isInterchange: false },
      { id: 3, isInterchange: false },
    ],
    segments: [
      { id: 1, lineId: 1, stationAId: 1, stationBId: 2 },
      { id: 2, lineId: 2, stationAId: 2, stationBId: 3 },
    ],
  };
  const nonInterchangeChangeGame = {
    startStation: { id: 1 },
    destinationStation: { id: 3 },
  };
  const nonInterchangeChangeRoute = [{ segmentId: 1 }, { segmentId: 2 }];
  assert.deepEqual(
    apiInternals.validateRoute(
      nonInterchangeChangeRoute,
      nonInterchangeChangeGame,
      nonInterchangeNetwork,
    ),
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
    { segmentId: 14 },
  ];

  assert.deepEqual(apiInternals.validateRoute(routeWithExtraSegment, game, network), {
    valid: false,
    reason: "The selected segments cannot form a valid route.",
  });
});

test("automatic submit just after the planning deadline validates the current route", async () => {
  execFileSync("node", ["init-db.js"], { cwd: import.meta.dirname });

  await withTestServer(async (baseUrl) => {
    const cookie = await login(baseUrl);
    const originalRandom = Math.random;
    Math.random = () => 0;
    const gameResponse = await fetch(`${baseUrl}/api/games`, {
      method: "POST",
      headers: { Cookie: cookie },
    });
    const game = await gameResponse.json();
    const originalNow = Date.now;

    Date.now = () => new Date(game.planningDeadline).getTime() + 1000;
    try {
      const submitResponse = await fetch(
        `${baseUrl}/api/games/${game.gameId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookie,
          },
          body: JSON.stringify({
            route: [
              { segmentId: 1 },
              { segmentId: 2 },
              { segmentId: 3 },
            ],
          }),
        },
      );
      const result = await submitResponse.json();

      assert.equal(submitResponse.status, 200);
      assert.equal(result.valid, true);
      assert.equal(result.finalScore, 20);
      assert.equal(result.steps.length, 3);
    } finally {
      Date.now = originalNow;
      Math.random = originalRandom;
    }
  });
});

test("manual submit long after the planning deadline ends the game with score zero", async () => {
  execFileSync("node", ["init-db.js"], { cwd: import.meta.dirname });

  await withTestServer(async (baseUrl) => {
    const cookie = await login(baseUrl);
    const originalRandom = Math.random;
    Math.random = () => 0;
    const gameResponse = await fetch(`${baseUrl}/api/games`, {
      method: "POST",
      headers: { Cookie: cookie },
    });
    const game = await gameResponse.json();
    const originalNow = Date.now;

    Date.now = () => new Date(game.planningDeadline).getTime() + 11000;
    try {
      const submitResponse = await fetch(
        `${baseUrl}/api/games/${game.gameId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookie,
          },
          body: JSON.stringify({
            route: [
              { segmentId: 1 },
              { segmentId: 2 },
              { segmentId: 3 },
            ],
          }),
        },
      );
      const result = await submitResponse.json();

      assert.equal(submitResponse.status, 200);
      assert.equal(result.valid, false);
      assert.equal(result.reason, "Planning time expired.");
      assert.equal(result.finalScore, 0);
      assert.deepEqual(result.steps, []);
    } finally {
      Date.now = originalNow;
      Math.random = originalRandom;
    }
  });
});

test("execution creates ordered steps from a valid route", () => {
  const route = [
    { segmentId: 1, fromStationId: 1, toStationId: 2 },
    { segmentId: 2, fromStationId: 2, toStationId: 3 },
  ];
  const events = [{ id: 1, description: "Bonus", effect: 2 }];

  assert.deepEqual(apiInternals.runExecution(route, events), [
    {
      order: 1,
      segmentId: 1,
      fromStationId: 1,
      toStationId: 2,
      event: events[0],
      coins: 22,
    },
    {
      order: 2,
      segmentId: 2,
      fromStationId: 2,
      toStationId: 3,
      event: events[0],
      coins: 24,
    },
  ]);
});
