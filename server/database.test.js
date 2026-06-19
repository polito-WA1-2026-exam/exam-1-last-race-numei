import test from "node:test";
import assert from "node:assert/strict";
import {
  getDatabaseSummary,
  getNetwork,
  getUser,
  listRanking,
} from "./dao.js";

test("seed database satisfies the exam requirements", async () => {
  const summary = await getDatabaseSummary();

  assert.ok(summary.lines >= 4);
  assert.ok(summary.stations >= 12);
  assert.ok(summary.interchangeStations >= 3);
  assert.ok(summary.events >= 8);
  assert.ok(summary.users >= 3);
  assert.equal(summary.usersWithCompletedGames, 2);
  assert.ok(summary.interchangeStations <= summary.stations / 2);
});

test("network exposes stations, lines, and selectable segments", async () => {
  const network = await getNetwork();

  assert.equal(network.stations.length, 12);
  assert.equal(network.lines.length, 4);
  assert.ok(network.segments.length >= 12);
  assert.ok(network.stations.every((station) => Number.isInteger(station.x)));
  assert.ok(network.stations.every((station) => Number.isInteger(station.y)));
});

test("users use salted password hashes compatible with Passport login", async () => {
  const user = await getUser("alice", "password");
  const wrongPassword = await getUser("alice", "wrong-password");

  assert.deepEqual(user, { id: 1, username: "alice", name: "Alice Rossi" });
  assert.equal(wrongPassword, false);
});

test("ranking is computed from completed games", async () => {
  const ranking = await listRanking();

  assert.equal(ranking.length, 2);
  assert.equal(ranking[0].bestScore >= ranking[1].bestScore, true);
  assert.ok(ranking.every((row) => row.bestScore >= 0));
});
