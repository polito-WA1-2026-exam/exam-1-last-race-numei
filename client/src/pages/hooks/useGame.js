import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { GameApi } from "../api/gameApi.js";
import {
  transformGameDTOtoVO,
  transformNetworkDTOtoVO,
  transformRankingDTOtoVO,
  transformResultDTOtoVO,
} from "../adapters/gameAdapter.js";
import {
  getRouteEndStationId,
  selectRouteSegment,
} from "../utils/routeSelection.js";

const GameContext = createContext(undefined);

const idleStatus = { loading: false, error: "" };

export function GameProvider({ children }) {
  const [network, setNetwork] = useState(undefined);
  const [currentGame, setCurrentGame] = useState(undefined);
  const [selectedRoute, setSelectedRoute] = useState([]);
  const [submittedResult, setSubmittedResult] = useState(undefined);
  const [ranking, setRanking] = useState([]);
  const [networkStatus, setNetworkStatus] = useState(idleStatus);
  const [gameStatus, setGameStatus] = useState(idleStatus);
  const [rankingStatus, setRankingStatus] = useState(idleStatus);
  const [routeError, setRouteError] = useState("");

  const stationById = useMemo(() => {
    const stations = currentGame?.stations ?? network?.stations ?? [];
    return new Map(stations.map((station) => [station.id, station]));
  }, [currentGame, network]);

  const segmentById = useMemo(() => {
    const segments = currentGame?.segments ?? network?.segments ?? [];
    return new Map(segments.map((segment) => [segment.id, segment]));
  }, [currentGame, network]);

  const currentStationId = useMemo(
    () => getRouteEndStationId(selectedRoute, currentGame?.startStation.id),
    [currentGame, selectedRoute],
  );

  const usedSegmentIds = useMemo(
    () => new Set(selectedRoute.map((step) => step.segmentId)),
    [selectedRoute],
  );

  const routeSteps = useMemo(
    () =>
      selectedRoute.map((step, index) => ({
        ...step,
        order: index + 1,
        segment: segmentById.get(step.segmentId),
        fromStation: stationById.get(step.fromStationId),
        toStation: stationById.get(step.toStationId),
      })),
    [segmentById, selectedRoute, stationById],
  );

  const loadNetwork = useCallback(async () => {
    setNetworkStatus({ loading: true, error: "" });
    try {
      const nextNetwork = transformNetworkDTOtoVO(await GameApi.getNetwork());
      setNetwork(nextNetwork);
      setNetworkStatus(idleStatus);
      return nextNetwork;
    } catch (err) {
      setNetworkStatus({ loading: false, error: err.message });
      throw err;
    }
  }, []);

  const startGame = useCallback(async () => {
    setGameStatus({ loading: true, error: "" });
    setRouteError("");
    setSelectedRoute([]);
    setSubmittedResult(undefined);

    try {
      const game = transformGameDTOtoVO(await GameApi.startGame());
      setCurrentGame(game);
      setGameStatus(idleStatus);
      return game;
    } catch (err) {
      setGameStatus({ loading: false, error: err.message });
      throw err;
    }
  }, []);

  const restoreGame = useCallback((game) => {
    if (!game) return;
    setRouteError("");
    setSelectedRoute([]);
    setSubmittedResult(undefined);
    setCurrentGame(game);
  }, []);

  const selectSegment = useCallback(
    (segment) => {
      if (!currentGame) return;

      setSelectedRoute((currentRoute) => {
        const selection = selectRouteSegment(
          currentRoute,
          currentGame.startStation.id,
          segment,
        );
        setRouteError(selection.error);
        return selection.route;
      });
    },
    [currentGame],
  );

  const removeLastSegment = useCallback(() => {
    setRouteError("");
    setSelectedRoute((currentRoute) => currentRoute.slice(0, -1));
  }, []);

  const clearRoute = useCallback(() => {
    setRouteError("");
    setSelectedRoute([]);
  }, []);

  const submitRoute = useCallback(
    async (routeOverride) => {
      if (!currentGame) throw new Error("No active game.");

      setGameStatus({ loading: true, error: "" });
      try {
        const route = routeOverride ?? selectedRoute;
        const result = transformResultDTOtoVO(
          await GameApi.submitRoute(currentGame.gameId, route),
        );
        setSubmittedResult(result);
        setGameStatus(idleStatus);
        return result;
      } catch (err) {
        setGameStatus({ loading: false, error: err.message });
        throw err;
      }
    },
    [currentGame, selectedRoute],
  );

  const fetchResult = useCallback(async (gameId) => {
    setGameStatus({ loading: true, error: "" });
    try {
      const result = transformResultDTOtoVO(await GameApi.getResult(gameId));
      setSubmittedResult(result);
      setGameStatus(idleStatus);
      return result;
    } catch (err) {
      setGameStatus({ loading: false, error: err.message });
      throw err;
    }
  }, []);

  const loadRanking = useCallback(async () => {
    setRankingStatus({ loading: true, error: "" });
    try {
      const nextRanking = transformRankingDTOtoVO(await GameApi.getRanking());
      setRanking(nextRanking);
      setRankingStatus(idleStatus);
      return nextRanking;
    } catch (err) {
      setRankingStatus({ loading: false, error: err.message });
      throw err;
    }
  }, []);

  const value = useMemo(
    () => ({
      clearRoute,
      currentGame,
      currentStationId,
      fetchResult,
      gameStatus,
      loadNetwork,
      loadRanking,
      network,
      networkStatus,
      ranking,
      rankingStatus,
      removeLastSegment,
      restoreGame,
      routeError,
      routeSteps,
      selectSegment,
      selectedRoute,
      startGame,
      stationById,
      submittedResult,
      submitRoute,
      usedSegmentIds,
    }),
    [
      clearRoute,
      currentGame,
      currentStationId,
      fetchResult,
      gameStatus,
      loadNetwork,
      loadRanking,
      network,
      networkStatus,
      ranking,
      rankingStatus,
      removeLastSegment,
      restoreGame,
      routeError,
      routeSteps,
      selectSegment,
      selectedRoute,
      startGame,
      stationById,
      submittedResult,
      submitRoute,
      usedSegmentIds,
    ],
  );

  return createElement(GameContext.Provider, { value }, children);
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used inside GameProvider");
  return context;
}
