import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Box, Button, CircularProgress, Stack } from "@mui/material";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import { InfoTile } from "./components/InfoTile.jsx";
import { NetworkMap } from "./components/NetworkMap.jsx";
import { PagePanel } from "./components/PagePanel.jsx";
import { StatusPanel } from "./components/StatusPanel.jsx";
import { useGame } from "./hooks/useGame.js";
import { throttle } from "./utils/util.js";

export function SetupPage() {
  const navigate = useNavigate();
  const { gameStatus, loadNetwork, network, networkStatus, startGame } =
    useGame();

  useEffect(() => {
    if (!network && !networkStatus.loading) {
      loadNetwork().catch(() => {});
    }
  }, [loadNetwork, network, networkStatus.loading]);

  const handleStartGame = useMemo(
    () =>
      throttle(async () => {
        try {
          const game = await startGame();
          navigate(`/games/${game.gameId}/planning`, { state: { game } });
        } catch {
          // The hook stores the error message for rendering.
        }
      }, 1000),
    [navigate, startGame],
  );

  return (
    <PagePanel
      action={
        <Stack direction="row" spacing={1}>
          <Button
            disabled={!network || gameStatus.loading}
            onClick={handleStartGame}
            size="large"
            startIcon={
              gameStatus.loading ? (
                <CircularProgress color="inherit" size={18} />
              ) : (
                <PlayArrowOutlinedIcon />
              )
            }
            variant="contained"
          >
            Start new game
          </Button>
          <Button
            onClick={() => navigate("/ranking")}
            size="large"
            startIcon={<EmojiEventsOutlinedIcon />}
            variant="outlined"
          >
            Ranking
          </Button>
        </Stack>
      }
      icon={<MapOutlinedIcon />}
      subtitle="Inspect the complete underground network before starting the timed planning phase."
      title="Setup"
    >
      <StatusPanel
        error={networkStatus.error || gameStatus.error}
        loading={networkStatus.loading}
      />

      {network && (
        <Stack spacing={3}>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
            }}
          >
            <InfoTile
              icon={<MapOutlinedIcon />}
              label="Stations"
              value={network.stations.length}
            />
            <InfoTile
              icon={<MapOutlinedIcon />}
              label="Lines"
              value={network.lines.length}
            />
            <InfoTile
              icon={<MapOutlinedIcon />}
              label="Segments"
              value={network.segments.length}
            />
            <InfoTile
              icon={<MapOutlinedIcon />}
              label="Interchanges"
              value={
                network.stations.filter((station) => station.isInterchange)
                  .length
              }
            />
          </Box>
          <NetworkMap
            lines={network.lines}
            segments={network.segments}
            showLineNames={false}
            showSegments
            stations={network.stations}
          />
        </Stack>
      )}
    </PagePanel>
  );
}
