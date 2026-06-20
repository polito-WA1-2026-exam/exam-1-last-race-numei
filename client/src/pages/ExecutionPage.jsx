import { useEffect } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router'
import { Alert, Button } from '@mui/material'
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'
import { ExecutionSteps } from './components/ExecutionSteps.jsx'
import { PagePanel } from './components/PagePanel.jsx'
import { StatusPanel } from './components/StatusPanel.jsx'
import { useGame } from './hooks/useGame.js'

export function ExecutionPage() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const { fetchResult, gameStatus, stationById, submittedResult } = useGame()

  useEffect(() => {
    if (!submittedResult) {
      fetchResult(gameId).catch(() => {})
    }
  }, [fetchResult, gameId, submittedResult])

  const result = submittedResult

  if (!result) {
    return (
      <PagePanel
        icon={<PlayArrowOutlinedIcon />}
        subtitle="Retrieving the submitted route result."
        title="Execution"
      >
        <StatusPanel error={gameStatus.error} loading={gameStatus.loading} />
      </PagePanel>
    )
  }

  if (!result.valid) {
    return (
      <PagePanel
        action={
          <Button component={RouterLink} to={`/games/${gameId}/result`} variant="contained">
            View result
          </Button>
        }
        icon={<PlayArrowOutlinedIcon />}
        subtitle="Invalid or incomplete routes skip execution and receive a score of zero."
        title="Execution skipped"
      >
        <Alert severity="warning">{result.reason ?? 'The submitted route is not valid.'}</Alert>
      </PagePanel>
    )
  }

  return (
    <PagePanel
      icon={<PlayArrowOutlinedIcon />}
      subtitle="Reveal each unexpected event in sequence and watch the coin total change."
      title="Execution"
    >
      <ExecutionSteps
        onFinish={() => navigate(`/games/${gameId}/result`)}
        result={result}
        stationById={stationById}
      />
    </PagePanel>
  )
}
