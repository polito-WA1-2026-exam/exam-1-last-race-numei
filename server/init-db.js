import crypto from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sqlite from "sqlite3";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "last-race.sqlite");
const db = new sqlite.Database(dbPath);

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

const hashPassword = (password, salt) =>
  new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString("hex"));
    });
  });

const users = [
  {
    id: 1,
    username: "alice",
    name: "Alice Rossi",
    password: "bB2257894902@",
    salt: "alice-salt",
  },
  {
    id: 2,
    username: "bruno",
    name: "Bruno Verdi",
    password: "bB2257894902@",
    salt: "bruno-salt",
  },
  {
    id: 3,
    username: "carla",
    name: "Carla Bianchi",
    password: "bB2257894902@",
    salt: "carla-salt",
  },
];

const stations = [
  [1, "Centrale", 1],
  [2, "Porta Velaria", 1],
  [3, "Crocevia del Falco", 0],
  [4, "Piazza delle Lanterne", 1],
  [5, "Fontana Oscura", 1],
  [6, "Borgo Sereno", 0],
  [7, "Viale dei Mosaici", 1],
  [8, "Torre Cinerea", 1],
  [9, "Campo dell'Eco", 0],
  [10, "Giardino del Sale", 0],
  [11, "Arco delle Nebbie", 0],
  [12, "Mercato Antico", 0],
];

const lines = [
  [1, "Red Line"],
  [2, "Blue Line"],
  [3, "Green Line"],
  [4, "Yellow Line"],
];

const segments = [
  [1, 1, 1, 2],
  [2, 1, 2, 3],
  [3, 1, 3, 4],
  [4, 2, 1, 10],
  [5, 2, 10, 5],
  [6, 2, 5, 6],
  [7, 2, 6, 7],
  [8, 3, 2, 5],
  [9, 3, 5, 8],
  [10, 4, 4, 7],
  [11, 4, 7, 9],
  [12, 4, 9, 8],
  [13, 4, 8, 12],
  [14, 4, 12, 11],
];

const events = [
  [1, "Quiet journey", 0],
  [2, "Wrong platform", -2],
  [3, "Kind passenger", 1],
  [4, "Express connection", 3],
  [5, "Ticket inspection", -1],
  [6, "Lost transfer", -4],
  [7, "Found coins", 2],
  [8, "Crowded train", -3],
];

const games = [
  [1, 1, 1, 9, 24, "2026-06-15T10:00:00.000Z"],
  [2, 1, 10, 4, 18, "2026-06-16T14:30:00.000Z"],
  [3, 2, 4, 11, 21, "2026-06-17T09:15:00.000Z"],
];

try {
  await run("PRAGMA foreign_keys = OFF");
  await run("DROP TABLE IF EXISTS games");
  await run("DROP TABLE IF EXISTS events");
  await run("DROP TABLE IF EXISTS segments");
  await run("DROP TABLE IF EXISTS lines");
  await run("DROP TABLE IF EXISTS stations");
  await run("DROP TABLE IF EXISTS users");
  await run("PRAGMA foreign_keys = ON");

  await run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    salt TEXT NOT NULL,
    password_hash TEXT NOT NULL
  )`);

  await run(`CREATE TABLE stations (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    is_interchange INTEGER NOT NULL CHECK (is_interchange IN (0, 1))
  )`);

  await run(`CREATE TABLE lines (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
  )`);

  await run(`CREATE TABLE segments (
    id INTEGER PRIMARY KEY,
    line_id INTEGER NOT NULL REFERENCES lines(id),
    station_a_id INTEGER NOT NULL REFERENCES stations(id),
    station_b_id INTEGER NOT NULL REFERENCES stations(id),
    CHECK (station_a_id <> station_b_id),
    UNIQUE (line_id, station_a_id, station_b_id)
  )`);

  await run(`CREATE TABLE events (
    id INTEGER PRIMARY KEY,
    description TEXT NOT NULL,
    effect INTEGER NOT NULL CHECK (effect BETWEEN -4 AND 4)
  )`);

  await run(`CREATE TABLE games (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    start_station_id INTEGER NOT NULL REFERENCES stations(id),
    destination_station_id INTEGER NOT NULL REFERENCES stations(id),
    score INTEGER NOT NULL CHECK (score >= 0),
    play_at TEXT NOT NULL
  )`);

  for (const user of users) {
    const passwordHash = await hashPassword(user.password, user.salt);
    await run(
      "INSERT INTO users(id, username, name, salt, password_hash) VALUES (?, ?, ?, ?, ?)",
      [user.id, user.username, user.name, user.salt, passwordHash],
    );
  }

  for (const station of stations)
    await run(
      "INSERT INTO stations(id, name, is_interchange) VALUES (?, ?, ?)",
      station,
    );

  for (const line of lines)
    await run("INSERT INTO lines(id, name) VALUES (?, ?)", line);

  for (const segment of segments)
    await run(
      "INSERT INTO segments(id, line_id, station_a_id, station_b_id) VALUES (?, ?, ?, ?)",
      segment,
    );

  for (const event of events)
    await run(
      "INSERT INTO events(id, description, effect) VALUES (?, ?, ?)",
      event,
    );

  for (const game of games)
    await run(
      "INSERT INTO games(id, user_id, start_station_id, destination_station_id, score, play_at) VALUES (?, ?, ?, ?, ?, ?)",
      game,
    );

  console.log(`Database initialized at ${dbPath}`);
} finally {
  db.close();
}
