import { useEffect } from 'react'
import { Link as RouterLink, useParams } from 'react-router'
import { Alert, Box, Button, Stack, Typography } from '@mui/material'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined'
import { PagePanel } from './components/PagePanel.jsx'
import { StatusPanel } from './components/StatusPanel.jsx'
import { useGame } from './hooks/useGame.js'

export function ResultPage() {
  const { gameId } = useParams()
  const { fetchResult, gameStatus, submittedResult } = useGame()

  useEffect(() => {
    if (!submittedResult) {
      fetchResult(gameId).catch(() => {})
    }
  }, [fetchResult, gameId, submittedResult])

  return (
    <PagePanel
      action={
        <Stack direction="row" spacing={1}>
          <Button
            component={RouterLink}
            startIcon={<ReplayOutlinedIcon />}
            to="/setup"
            variant="contained"
          >
            Start another game
          </Button>
          <Button
            component={RouterLink}
            startIcon={<EmojiEventsOutlinedIcon />}
            to="/ranking"
            variant="outlined"
          >
            Ranking
          </Button>
        </Stack>
      }
      icon={<FlagOutlinedIcon />}
      subtitle="The final score is the number of coins remaining after route validation and execution."
      title="Result"
    >
      <StatusPanel error={gameStatus.error} loading={gameStatus.loading && !submittedResult} />
      {submittedResult && (
        <Stack spacing={2}>
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 3,
            }}
          >
            <Typography color="text.secondary" variant="overline">
              Final score
            </Typography>
            <Typography color={submittedResult.valid ? 'secondary.main' : 'error.main'} variant="h2">
              {submittedResult.finalScore}
            </Typography>
          </Box>
          {submittedResult.valid ? (
            <Alert severity="success">Route completed successfully.</Alert>
          ) : (
            <Alert severity="warning">
              {submittedResult.reason ?? 'The route was invalid or incomplete.'}
            </Alert>
          )}
        </Stack>
      )}
    </PagePanel>
  )
}
