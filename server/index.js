import express from "express";
import morgan from "morgan";
import cors from "cors";
import passport from "passport";
import LocalStrategy from "passport-local";
import session from "express-session";
import { body, validationResult } from "express-validator";
import { pathToFileURL } from "node:url";
import {
  createGameResult,
  getGameResult,
  getNetwork,
  getUser,
  listEvents,
  listRanking,
} from "./dao.js";

const INITIAL_COINS = 20; //support dynamic configuration
const PLANNING_SECONDS = 90;
const port = 3001;
const activeGames = new Map();
let nextGameId = 1;

export const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

passport.use(
  new LocalStrategy(async (username, password, cb) => {
    try {
      const user = await getUser(username, password);
      if (!user)
        return cb(null, false, { message: "Incorrect username or password." });
      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  }),
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.use(
  session({
    secret: "last race session secret",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.authenticate("session"));

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: "Not authorized" });
};

const checkValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });
  return next();
};

const buildGraph = (segments) => {
  const graph = new Map();
  for (const segment of segments) {
    if (!graph.has(segment.stationAId)) graph.set(segment.stationAId, []);
    if (!graph.has(segment.stationBId)) graph.set(segment.stationBId, []);
    graph.get(segment.stationAId).push(segment.stationBId);
    graph.get(segment.stationBId).push(segment.stationAId);
  }
  return graph;
};

const shortestDistance = (graph, startId, destinationId) => {
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

const selectStartAndDestination = (network) => {
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

const toPlanningPayload = (network) => ({
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

  return {
    blockedByLineChange,
    orderedRoute: search({
      currentStationId: game.startStation.id,
      orderedRoute: [],
      previousLineId: undefined,
      usedSegmentIds: new Set(),
    }),
  };
};

const validateRoute = (route, game, network) => {
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

const runExecution = (route, events) => {
  let coins = INITIAL_COINS;

  return route.map((step, index) => {
    const event = events[Math.floor(Math.random() * events.length)];
    coins += event.effect;
    return {
      order: index + 1,
      segmentId: step.segmentId,
      currentStationId: game.startStation.id,
      fromStationId: step.fromStationId,
      toStationId: step.toStationId,
      event,
      coins,
    };
  });
};

app.post("/api/sessions", passport.authenticate("local"), (req, res) => {
  res.status(201).json(req.user);
});

app.get("/api/sessions/current", (req, res) => {
  if (req.isAuthenticated()) return res.json(req.user);
  return res.status(401).json({ error: "Not authenticated" });
});

app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => res.end());
});

app.get("/api/network", isLoggedIn, async (req, res) => {
  try {
    const network = await getNetwork();
    res.json(network);
  } catch {
    res.status(500).json({ error: "Unable to retrieve the network." });
  }
});

app.post("/api/games", isLoggedIn, async (req, res) => {
  try {
    const network = await getNetwork();
    const { start, destination } = selectStartAndDestination(network);
    const planningDeadline = new Date(
      Date.now() + PLANNING_SECONDS * 1000,
    ).toISOString();
    const gameId = nextGameId++;
    const game = {
      id: gameId,
      userId: req.user.id,
      startStation: start,
      destinationStation: destination,
      planningDeadline,
      completedResult: null,
    };

    activeGames.set(gameId, game);

    res.status(201).json({
      gameId,
      initialCoins: INITIAL_COINS,
      planningSeconds: PLANNING_SECONDS,
      planningDeadline,
      startStation: start,
      destinationStation: destination,
      ...toPlanningPayload(network),
    });
  } catch {
    res.status(500).json({ error: "Unable to start a new game." });
  }
});

app.post(
  "/api/games/:gameId/submit",
  isLoggedIn,
  body("route").isArray(),
  body("route.*.segmentId").isInt({ min: 1 }),
  checkValidationErrors,
  async (req, res) => {
    const gameId = Number(req.params.gameId);
    const game = activeGames.get(gameId);

    if (!game || game.userId !== req.user.id) {
      return res.status(404).json({ error: "Game not found." });
    }

    try {
      const network = await getNetwork();
      const route = req.body.route.map((step) => ({
        segmentId: Number(step.segmentId),
        fromStationId: Number(step.fromStationId),
        toStationId: Number(step.toStationId),
      }));
      const validation = validateRoute(route, game, network);
      let steps = [];
      let finalScore = 0;

      if (validation.valid) {
        steps = runExecution(validation.orderedRoute, await listEvents());
        finalScore = Math.max(0, steps.at(-1)?.coins ?? INITIAL_COINS);
      }

      const dbGameId = await createGameResult({
        userId: req.user.id,
        startStationId: game.startStation.id,
        destinationStationId: game.destinationStation.id,
        score: finalScore,
        playAt: new Date().toISOString(),
      });

      game.completedResult = {
        gameId,
        dbGameId,
        valid: validation.valid,
        reason: validation.reason,
        steps,
        finalScore,
      };

      return res.json(game.completedResult);
    } catch {
      return res.status(500).json({ error: "Unable to submit the route." });
    }
  },
);

app.get("/api/games/:gameId/result", isLoggedIn, async (req, res) => {
  const gameId = Number(req.params.gameId);
  const game = activeGames.get(gameId);

  if (game?.userId === req.user.id && game.completedResult) {
    return res.json(game.completedResult);
  }

  try {
    const result = await getGameResult(gameId, req.user.id);
    if (result.error) return res.status(404).json(result);
    return res.json(result);
  } catch {
    return res
      .status(500)
      .json({ error: "Unable to retrieve the game result." });
  }
});

app.get("/api/ranking", isLoggedIn, async (req, res) => {
  try {
    const ranking = await listRanking();
    res.json(ranking);
  } catch {
    res.status(500).json({ error: "Unable to retrieve the ranking." });
  }
});

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  app.listen(port, () => {
    console.log(`API server started at http://localhost:${port}`);
  });
}

export const apiInternals = {
  buildGraph,
  shortestDistance,
  selectStartAndDestination,
  toPlanningPayload,
  validateRoute,
};
