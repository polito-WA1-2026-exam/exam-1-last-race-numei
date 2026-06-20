import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined'
import { NetworkMap } from './components/NetworkMap.jsx'
import { PagePanel } from './components/PagePanel.jsx'
import { RouteSummary } from './components/RouteSummary.jsx'
import { SegmentPicker } from './components/SegmentPicker.jsx'
import { StatusPanel } from './components/StatusPanel.jsx'
import { useCountdown } from './hooks/useCountdown.js'
import { useGame } from './hooks/useGame.js'
import { debounce } from './util.js'

export function PlanningPage() {
  const { gameId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const autoSubmitted = useRef(false)
  const [submitting, setSubmitting] = useState(false)
  const {
    clearRoute,
    currentGame,
    currentStationId,
    gameStatus,
    removeLastSegment,
    restoreGame,
    routeError,
    routeSteps,
    selectSegment,
    stationById,
    submitRoute,
    submittedResult,
    usedSegmentIds,
  } = useGame()
  const remainingSeconds = useCountdown(currentGame?.planningDeadline)
  const planningProgress = currentGame
    ? (remainingSeconds / currentGame.planningSeconds) * 100
    : 0

  useEffect(() => {
    if (!currentGame && location.state?.game) {
      restoreGame(location.state.game)
    }
  }, [currentGame, location.state, restoreGame])

  const submitSelectedRoute = useCallback(async () => {
    if (!currentGame || submitting) return
    setSubmitting(true)

    try {
      const result = await submitRoute()
      navigate(result.valid ? `/games/${currentGame.gameId}/execution` : `/games/${currentGame.gameId}/result`)
    } catch {
      setSubmitting(false)
    }
  }, [currentGame, navigate, submitRoute, submitting])

  const handleSubmit = useMemo(
    () => debounce(submitSelectedRoute, 250),
    [submitSelectedRoute],
  )

  useEffect(() => {
    autoSubmitted.current = false
  }, [currentGame?.gameId])

  useEffect(() => {
    if (!currentGame || submittedResult || submitting) return
    if (remainingSeconds === 0 && !autoSubmitted.current) {
      autoSubmitted.current = true
      submitSelectedRoute()
    }
  }, [currentGame, remainingSeconds, submitSelectedRoute, submittedResult, submitting])

  if (!currentGame || String(currentGame.gameId) !== gameId) {
    return (
      <PagePanel
        action={
          <Button component={RouterLink} to="/setup" variant="contained">
            Go to setup
          </Button>
        }
        icon={<TimerOutlinedIcon />}
        subtitle="Start a new game from the setup page before entering the planning phase."
        title="No active game"
      />
    )
  }

  const currentStation = stationById.get(currentStationId)

  return (
    <PagePanel
      action={
        <Button
          disabled={submitting || gameStatus.loading}
          onClick={handleSubmit}
          size="large"
          startIcon={
            submitting ? (
              <CircularProgress color="inherit" size={18} />
            ) : (
              <SendOutlinedIcon />
            )
          }
          variant="contained"
        >
          Submit route
        </Button>
      }
      icon={<TimerOutlinedIcon />}
      subtitle="The map only shows station names. Build a route by selecting connected segment pairs in sequence."
      title="Planning"
    >
      <StatusPanel error={gameStatus.error} loading={gameStatus.loading && !submitting} />
      <Stack spacing={3}>
        <Box>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 1 }}>
            <Typography sx={{ fontWeight: 800 }}>Time left: {remainingSeconds}s</Typography>
            <Typography color="text.secondary">
              {currentGame.startStation.name}
              {' -> '}
              {currentGame.destinationStation.name}
            </Typography>
          </Stack>
          <LinearProgress color="secondary" value={planningProgress} variant="determinate" />
        </Box>

        {remainingSeconds === 0 && (
          <Alert severity="info">Time is over. The current route is being submitted.</Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' },
          }}
        >
          <NetworkMap
            currentStationId={currentStationId}
            destinationStationId={currentGame.destinationStation.id}
            selectedRoute={routeSteps}
            showSegments={false}
            startStationId={currentGame.startStation.id}
            stations={currentGame.stations}
          />
          <RouteSummary
            currentStation={currentStation}
            destinationStation={currentGame.destinationStation}
            onClear={clearRoute}
            onRemoveLast={removeLastSegment}
            routeSteps={routeSteps}
            startStation={currentGame.startStation}
          />
        </Box>

        <SegmentPicker
          disabled={submitting || remainingSeconds === 0}
          onSelectSegment={selectSegment}
          routeError={routeError}
          segments={currentGame.segments}
          usedSegmentIds={usedSegmentIds}
        />
      </Stack>
    </PagePanel>
  )
}
