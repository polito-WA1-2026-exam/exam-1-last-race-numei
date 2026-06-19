import crypto from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sqlite from "sqlite3";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new sqlite.Database(join(__dirname, "last-race.sqlite"), (err) => {
  if (err) throw err;
});

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

export const getUser = (username, password) =>
  new Promise((resolve, reject) => {
    const sql = "SELECT id, username, name, salt, password_hash FROM users WHERE username = ?";
    db.get(sql, [username], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        resolve(false);
      } else {
        crypto.scrypt(password, row.salt, 64, (scryptErr, derivedKey) => {
          if (scryptErr) {
            reject(scryptErr);
            return;
          }

          const storedHash = Buffer.from(row.password_hash, "hex");
          const passwordMatches =
            storedHash.length === derivedKey.length && crypto.timingSafeEqual(storedHash, derivedKey);

          if (!passwordMatches) resolve(false);
          else resolve({ id: row.id, username: row.username, name: row.name });
        });
      }
    });
  });

export const getNetwork = async () => {
  const stations = await all(
    `SELECT id, name, is_interchange AS isInterchange, x, y
     FROM stations
     ORDER BY id`,
  );
  const lines = await all("SELECT id, name FROM lines ORDER BY id");
  const segments = await all(
    `SELECT
       s.id,
       s.line_id AS lineId,
       l.name AS lineName,
       s.station_a_id AS stationAId,
       a.name AS stationAName,
       s.station_b_id AS stationBId,
       b.name AS stationBName
     FROM segments s
     JOIN lines l ON s.line_id = l.id
     JOIN stations a ON s.station_a_id = a.id
     JOIN stations b ON s.station_b_id = b.id
     ORDER BY s.id`,
  );

  return { stations, lines, segments };
};

export const listEvents = () =>
  all("SELECT id, description, effect FROM events ORDER BY id");

export const createGameResult = async (game) => {
  const result = await run(
    `INSERT INTO games(user_id, start_station_id, destination_station_id, score, play_at)
     VALUES (?, ?, ?, ?, ?)`,
    [
      game.userId,
      game.startStationId,
      game.destinationStationId,
      Math.max(0, game.score),
      game.playAt,
    ],
  );
  return result.lastID;
};

export const getGameResult = async (gameId, userId) => {
  const row = await get(
    `SELECT
       g.id,
       g.user_id AS userId,
       g.start_station_id AS startStationId,
       start.name AS startStationName,
       g.destination_station_id AS destinationStationId,
       dest.name AS destinationStationName,
       g.score,
       g.play_at AS playAt
     FROM games g
     JOIN stations start ON g.start_station_id = start.id
     JOIN stations dest ON g.destination_station_id = dest.id
     WHERE g.id = ? AND g.user_id = ?`,
    [gameId, userId],
  );

  return row ?? { error: "Game not found." };
};

export const listRanking = () =>
  all(
    `SELECT
       u.id AS userId,
       u.username,
       u.name,
       MAX(g.score) AS bestScore
     FROM users u
     JOIN games g ON g.user_id = u.id
     GROUP BY u.id, u.username, u.name
     ORDER BY bestScore DESC, u.username ASC`,
  );

export const getDatabaseSummary = async () => {
  const rows = await Promise.all([
    get("SELECT COUNT(*) AS value FROM lines"),
    get("SELECT COUNT(*) AS value FROM stations"),
    get("SELECT COUNT(*) AS value FROM stations WHERE is_interchange = 1"),
    get("SELECT COUNT(*) AS value FROM events"),
    get("SELECT COUNT(*) AS value FROM users"),
    get("SELECT COUNT(DISTINCT user_id) AS value FROM games"),
  ]);

  return {
    lines: rows[0].value,
    stations: rows[1].value,
    interchangeStations: rows[2].value,
    events: rows[3].value,
    users: rows[4].value,
    usersWithCompletedGames: rows[5].value,
  };
};
