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
import {
  INITIAL_COINS,
  PLANNING_SECONDS,
  buildGraph,
  runExecution,
  selectStartAndDestination,
  shortestDistance,
  toPlanningPayload,
  validateRoute,
} from "./routeService.js";

const port = 3001;
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const AUTO_SUBMIT_GRACE_MS = 5000;
const activeGames = new Map();
let nextGameId = 1;

export const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use(
  cors({
    origin: clientOrigin,
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

const isPlanningSubmitWindowClosed = (game) =>
  Date.now() >
  new Date(game.planningDeadline).getTime() + AUTO_SUBMIT_GRACE_MS;

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
    if (game.completedResult) return res.json(game.completedResult);

    try {
      if (isPlanningSubmitWindowClosed(game)) {
        const dbGameId = await createGameResult({
          userId: req.user.id,
          startStationId: game.startStation.id,
          destinationStationId: game.destinationStation.id,
          score: 0,
          playAt: new Date().toISOString(),
        });

        game.completedResult = {
          gameId,
          dbGameId,
          valid: false,
          reason: "Planning time expired.",
          steps: [],
          finalScore: 0,
        };

        return res.json(game.completedResult);
      }

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

  if (game) {
    if (game.userId !== req.user.id) {
      return res.status(404).json({ error: "Game not found." });
    }
    if (game.completedResult) return res.json(game.completedResult);
    return res.status(404).json({ error: "Game result not available yet." });
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
  runExecution,
};
